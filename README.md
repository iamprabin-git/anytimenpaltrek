# Anytime Nepal Trek

A full-stack trekking and tour website inspired by [Travel Nepal Now](https://travelnepalnow.com/), built with **Laravel** (API backend) and **Next.js** (React frontend).

## Project Structure

```
anytimenepaltrek/
├── backend/     # Laravel 13 API
└── frontend/    # Next.js 16 + React 19 + Tailwind CSS
```

## Features

- Hero slider, featured treks, destinations (Nepal/Tibet/Bhutan)
- Best selling packages, trip of the season
- Trekking, tours, and adventure holiday listings
- Package detail pages with Stripe payment checkout
- Travel blog
- Customer reviews section with public submission form
- Admin panel for reviews, inquiries, and bookings
- Contact form with API submission

## User Roles

The platform has three roles:

| Role | Portal | Responsibilities |
|------|--------|------------------|
| **Admin** | `/admin/login` | Create/manage agents, company name, logo, address, dynamic settings |
| **Agent** | `/agent/login` | Create tours/treks, create & approve users, approve reviews, manage inquiries & bookings |
| **User** | `/login` | Register (pending approval), book trips, manage profile & bookings |

### Default credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@anytimenepaltrek.com | password |
| Agent | agent@anytimenepaltrek.com | password |

Users register at `/login` and must be approved by an agent before they can log in.

## Admin Panel

URL: http://localhost:3000/admin/login

- Manage agents (create, activate/deactivate, delete)
- Company settings (name, logo, address, phone, email, dynamic JSON parameters)

## Agent Panel

URL: http://localhost:3000/agent/login

- Dashboard with operational stats
- Create/manage tour & trek packages
- Create users and approve pending registrations
- Approve/reject reviews
- Manage contact inquiries and view bookings

## Customer Account

URL: http://localhost:3000/login

- Register and wait for agent approval
- Profile management at `/account`
- View bookings at `/account/bookings`

## Stripe Payments

Add to `backend/.env`:

```
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

Package detail pages show a **Pay Now** button that redirects to Stripe Checkout. Without Stripe keys configured, users can still enquire via the contact form.

## Review Submission

Public form at `/reviews/write`. Submitted reviews are pending until approved in the admin panel.

## Getting Started

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

API runs at `http://localhost:8000/api`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

Ensure `frontend/.env.local` contains:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/home` | Homepage data |
| GET | `/api/packages?category=trekking` | List packages |
| GET | `/api/packages/{slug}` | Package detail |
| GET | `/api/blog-posts` | Blog list |
| GET | `/api/blog-posts/{slug}` | Blog post |
| POST | `/api/contact` | Submit enquiry |

## Tech Stack

- **Backend:** Laravel 13, SQLite/MySQL, REST API
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
