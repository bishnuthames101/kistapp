-- CreateIndex
CREATE INDEX "appointments_patient_id_appointment_date_idx" ON "appointments"("patient_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "laboratory_tests_patient_id_test_date_idx" ON "laboratory_tests"("patient_id", "test_date");

-- CreateIndex
CREATE INDEX "laboratory_tests_status_idx" ON "laboratory_tests"("status");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_created_at_idx" ON "medical_records"("created_at");

-- CreateIndex
CREATE INDEX "medicines_category_idx" ON "medicines"("category");

-- CreateIndex
CREATE INDEX "medicines_stock_idx" ON "medicines"("stock");

-- CreateIndex
CREATE INDEX "pharmacy_orders_patient_id_status_idx" ON "pharmacy_orders"("patient_id", "status");

-- CreateIndex
CREATE INDEX "pharmacy_orders_medicine_id_idx" ON "pharmacy_orders"("medicine_id");

-- CreateIndex
CREATE INDEX "pharmacy_orders_payment_status_idx" ON "pharmacy_orders"("payment_status");

-- CreateIndex
CREATE INDEX "prescriptions_patient_id_status_idx" ON "prescriptions"("patient_id", "status");

-- CreateIndex
CREATE INDEX "users_phone_is_active_idx" ON "users"("phone", "is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
