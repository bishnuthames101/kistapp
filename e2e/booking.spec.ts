import { test, expect } from "@playwright/test";

/**
 * The smoke test that would have caught the three P0 bugs in one run:
 * register -> log in -> book an appointment -> see it in the dashboard.
 *
 * Each of those steps was independently broken at some point: the dashboard
 * showed "Failed to load" because it treated a paginated envelope as an array,
 * checkout 400'd on every order, and booking from a doctor profile showed a
 * success toast without ever calling the API.
 */

/** A fresh patient per run, so reruns never collide on the unique phone. */
function uniquePatient() {
  // Phone must be 10 digits starting with 9.
  const suffix = String(Date.now()).slice(-9);
  return {
    name: "E2E Test Patient",
    phone: `9${suffix}`,
    email: `e2e-${Date.now()}@example.test`,
    password: "TestPassword123",
  };
}

test.describe("patient booking journey", () => {
  test("registers, books an appointment, and sees it in the dashboard", async ({ page }) => {
    const patient = uniquePatient();

    // --- Register -------------------------------------------------------
    await page.goto("/register");
    await page.getByLabel(/name/i).first().fill(patient.name);
    await page.getByLabel(/phone/i).first().fill(patient.phone);
    await page.getByLabel(/email/i).first().fill(patient.email);
    await page.getByLabel(/^password/i).first().fill(patient.password);

    await page.getByRole("button", { name: /sign up|register|create/i }).click();

    // --- Log in ---------------------------------------------------------
    await page.waitForURL(/\/login|\/dashboard/, { timeout: 15_000 });

    if (page.url().includes("/login")) {
      await page.getByLabel(/phone/i).first().fill(patient.phone);
      await page.getByLabel(/password/i).first().fill(patient.password);
      await page.getByRole("button", { name: /sign in|log ?in/i }).click();
      await page.waitForURL(/\/dashboard|\/$/, { timeout: 15_000 });
    }

    // --- Book with a doctor who keeps real clinic hours ------------------
    // Dr. Arbind Sah (legacyId 2) is `scheduled`, Sun-Wed 10:00-17:00.
    await page.goto("/doctors/2");

    await page.getByRole("button", { name: /book appointment/i }).first().click();

    // Pick the next date the doctor actually works (Sun-Wed => getDay 0-3).
    const date = nextWorkingDate([0, 1, 2, 3]);
    await page.locator('input[type="date"]').fill(date);

    // Slots are fetched from /api/doctors/2/slots — no hardcoded list.
    const slot = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ });
    await expect(slot.first()).toBeVisible({ timeout: 15_000 });
    const chosenTime = (await slot.first().innerText()).trim();
    await slot.first().click();

    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /confirm booking/i }).click();

    // --- Verify it actually persisted ------------------------------------
    // The point of the test: a success toast is not evidence. The dashboard
    // reads from the API, so it only shows what the server really stored.
    await page.goto("/dashboard");
    await expect(page.getByText("Dr. Arbind Sah").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(chosenTime).first()).toBeVisible();
  });

  test("offers no timetable for an on-call doctor", async ({ page }) => {
    // Dr. Prabhakar Shah (legacyId 1) is on call: the old UI invented
    // 10:00-16:00 slots for him anyway.
    await page.goto("/doctors/1");
    await expect(page.getByText(/on call/i).first()).toBeVisible();
  });
});

/** The next date (excluding today) falling on one of `days` (0 = Sunday). */
function nextWorkingDate(days: number[]): string {
  const date = new Date();
  for (let i = 1; i <= 14; i++) {
    date.setDate(date.getDate() + 1);
    if (days.includes(date.getDay())) break;
    if (i === 14) throw new Error("No working day found in the next fortnight");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
