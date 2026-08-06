# Kist Poly Clinic - Next.js Frontend

This is the Next.js version of the Kist Poly Clinic frontend application, migrated from React + Vite.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS with custom glass-morphism design
- ✅ Authentication (JWT-based)
- ✅ Protected routes with middleware
- ✅ Context API for state management
- ✅ Axios for API calls
- ✅ Responsive design

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React, React Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running at `http://192.168.1.70:8000/api` (or update `.env.local`)

### Installation

```bash
cd frontend-nextjs
npm install
```

### Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.70:8000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend-nextjs/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx         # Home page
│   │   ├── layout.tsx       # Root layout
│   │   ├── providers.tsx    # Context providers
│   │   ├── globals.css      # Global styles
│   │   ├── login/           # Login page
│   │   ├── register/        # Register page
│   │   └── dashboard/       # Dashboard page
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── auth/            # Auth-related components
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ToastContext.tsx
│   ├── services/            # API services
│   │   └── api.ts           # Axios instance and API calls
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Static data
│   └── middleware.ts        # Next.js middleware for route protection
├── public/                  # Static assets
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── MIGRATION_GUIDE.md      # Detailed migration guide
└── package.json            # Dependencies
```

## Migration Status

### ✅ Completed

- Core Next.js setup
- Tailwind CSS configuration
- API services layer
- Context providers (Auth, Cart, Toast)
- Core components (Navbar, Footer, Auth forms)
- Core pages (Home, Login, Register, Dashboard)
- Middleware for protected routes

### 🚧 In Progress

- Remaining 16 pages need migration
- Some dashboard sub-pages
- Additional components

See `MIGRATION_GUIDE.md` for detailed migration instructions.

## Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/about` - About page (to be migrated)
- `/contact` - Contact page (to be migrated)
- `/services` - Services listing (to be migrated)
- `/doctors` - Doctors listing (to be migrated)
- `/lab-tests` - Lab tests (to be migrated)
- `/epharmacy` - Online pharmacy (to be migrated)

### Protected Routes
- `/dashboard` - User dashboard
- `/dashboard/*` - Dashboard sub-pages (to be migrated)

## API Integration

The app connects to the Django backend API. All API calls are centralized in `src/services/api.ts`.

### Example API Usage

```typescript
import { auth, appointments, medicines } from '@/services/api';

// Login
await auth.login(phone, password);

// Get appointments
const response = await appointments.getAll();

// Get medicines
const medicines = await medicines.getAll();
```

## Authentication Flow

1. User logs in via `/login`
2. JWT token stored in localStorage
3. Token added to all API requests via Axios interceptor
4. Protected routes checked by middleware
5. Unauthenticated users redirected to `/login`

## Custom Styles

The app uses a custom glass-morphism design with Tailwind CSS utility classes defined in `globals.css`:

- `.glass` - Base glass effect
- `.glass-card` - Card with glass effect
- `.glass-button` - Primary button with glass effect
- `.glass-input` - Input field with glass effect
- `.glass-navbar` - Navbar with glass effect

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

When adding new pages:

1. Create page in `src/app/[route]/page.tsx`
2. Add metadata export for SEO
3. Use 'use client' directive if using hooks
4. Update imports from React Router to Next.js
5. Test routing and functionality

See `MIGRATION_GUIDE.md` for detailed migration patterns.

## License

ISC

## Contact

Kist Poly Clinic
- Phone: +977-01-5202097
- Email: kistpolyclinic@gmail.com
- Address: Balkumari-Kharibot, Lalitpur, Nepal
