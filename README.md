# 🎫 Event Booking System

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Project Description

A full-stack event booking platform that enables users to discover, register for, and manage events with a seamless experience. The system supports role-based access control (Attendee, Organizer, Admin), real-time capacity management with atomic operations, email confirmations via Outlook SMTP, and QR code-based printable tickets. Built with a modern tech stack — Express.js REST API on the backend, React 19 with Tailwind CSS 4 on the frontend, and MongoDB for data persistence.

## Features

### Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (Attendee, Organizer, Admin)
- Secure password hashing with bcrypt
- Login attempt limiting and account locking
- Profile management and password change

### Events
- Full CRUD operations for event management
- Category-based classification (Music, Technology, Sports, Art, Business, etc.)
- Search, filtering, and pagination with debounced queries
- Event slug-based URLs for SEO-friendly routing
- Draft, published, cancelled, and completed status workflow
- Featured events showcase on homepage
- Image upload support with Multer

### Registration & Tickets
- Atomic capacity management preventing overbooking
- Unique confirmation codes (UUID-based)
- Email notifications for registration and cancellation
- QR code generation for each ticket
- Printable ticket view
- Registration cancellation support
- Per-user registration limits per event

### Organizer Dashboard
- Event statistics and analytics
- Attendee management and check-in system
- Revenue tracking and breakdown
- Recent registrations feed
- Upcoming events overview
- Event creation and editing with rich form

### Admin Panel
- System-wide dashboard with aggregate statistics
- User management (role updates, activation/deactivation, deletion)
- Event moderation (status updates, deletion)
- Registration oversight with pagination
- Full access to all platform data

### Security
- Helmet HTTP header protection
- CORS configuration with allowed origins
- Rate limiting (global, auth, registration, upload, confirmation)
- MongoDB query injection prevention (express-mongo-sanitize)
- Input validation with express-validator
- XSS prevention with HTML escaping
- Request body size limiting
- File upload size and type restrictions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router DOM, Axios |
| **Backend** | Node.js, Express.js 4 |
| **Database** | MongoDB with Mongoose ODM |
| **Styling** | Tailwind CSS 4 |
| **Email** | Nodemailer (Outlook SMTP) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **File Upload** | Multer |
| **QR Code** | qrcode.react |
| **Notifications** | React Hot Toast |
| **Build Tool** | Vite |

## Screenshots

![Home Page](screenshots/home.png)
![Event List](screenshots/event-list.png)
![Event Detail](screenshots/event-detail.png)
![My Tickets](screenshots/my-tickets.png)
![Organizer Dashboard](screenshots/organizer-dashboard.png)
![Admin Panel](screenshots/admin-panel.png)

## Roles & Permissions

| Feature | Attendee | Organizer | Admin |
|---------|----------|-----------|-------|
| Browse events | ✅ | ✅ | ✅ |
| Register for events | ✅ | ✅ | ✅ |
| View tickets | ✅ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Manage events | ❌ | Own only | All |
| View attendees | ❌ | Own events | All |
| Check-in attendees | ❌ | Own events | All |
| Manage users | ❌ | ❌ | ✅ |
| System dashboard | ❌ | ❌ | ✅ |

## API Endpoints

### Health Check

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/health` | Public | Server health check |

### Authentication (`/api/auth`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Authenticated | Get current user profile |
| PUT | `/api/auth/profile` | Authenticated | Update user profile |
| PUT | `/api/auth/change-password` | Authenticated | Change password |
| DELETE | `/api/auth/delete-account` | Authenticated | Delete own account |

### Events (`/api/events`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/events` | Public | List events (search, filter, paginate) |
| GET | `/api/events/featured` | Public | Get featured events |
| GET | `/api/events/categories` | Public | Get event categories |
| GET | `/api/events/id/:id` | Public | Get event by ID |
| GET | `/api/events/:slug` | Public | Get event by slug |
| POST | `/api/events` | Organizer | Create a new event |
| PUT | `/api/events/:id` | Organizer | Update own event |
| DELETE | `/api/events/:id` | Organizer | Delete own event |
| PUT | `/api/events/:id/publish` | Organizer | Publish a draft event |
| PUT | `/api/events/:id/cancel` | Organizer | Cancel an event |
| GET | `/api/events/:id/registrations` | Organizer | Get event registrations |
| GET | `/api/events/:id/stats` | Organizer | Get event statistics |
| POST | `/api/events/:id/register` | Authenticated | Register for an event |
| GET | `/api/events/my/organized` | Organizer | Get own organized events |

### Registrations (`/api/registrations`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/registrations/my` | Authenticated | Get own registrations |
| GET | `/api/registrations/code/:code` | Authenticated | Find registration by confirmation code |
| GET | `/api/registrations/:id` | Authenticated | Get registration details |
| PUT | `/api/registrations/:id/check-in` | Organizer | Check-in an attendee |
| DELETE | `/api/registrations/:id` | Authenticated | Cancel a registration |

### Users (`/api/users`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users/me/stats` | Authenticated | Get own statistics |
| GET | `/api/users/:id/profile` | Public | Get public user profile |
| GET | `/api/users/:id/organizer` | Public | Get organizer profile |

### Organizer (`/api/organizer`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/organizer/dashboard` | Organizer | Dashboard statistics |
| GET | `/api/organizer/revenue` | Organizer | Revenue breakdown |
| GET | `/api/organizer/recent-registrations` | Organizer | Recent registrations |
| GET | `/api/organizer/upcoming-events` | Organizer | Upcoming events list |

### Admin (`/api/admin`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | System-wide dashboard |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/role` | Admin | Update user role |
| PUT | `/api/admin/users/:id/toggle-active` | Admin | Toggle user active status |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user |
| GET | `/api/admin/events` | Admin | List all events |
| PUT | `/api/admin/events/:id/status` | Admin | Update event status |
| DELETE | `/api/admin/events/:id` | Admin | Delete an event |
| GET | `/api/admin/registrations` | Admin | List all registrations |

### Upload (`/api/upload`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/upload/image` | Organizer | Upload an event image |
| DELETE | `/api/upload/:filename` | Organizer | Delete an uploaded image |

## Email Setup (Outlook SMTP)

1. Go to [Microsoft Account Security](https://account.microsoft.com/security) → **App passwords**
2. Generate a new app password for "Event Booking System"
3. Configure the following environment variables:
   ```
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-generated-app-password
   SMTP_FROM_NAME=EventBooking
   ```
4. The server verifies the SMTP connection on startup and logs the result
5. In development mode, emails are logged to console if SMTP credentials are not configured

## Getting Started

### Prerequisites
- **Node.js** 18+
- **MongoDB** 6+ (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/event-booking-system.git
   cd event-booking-system
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

4. **Configure environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` and fill in your values (MongoDB URI, JWT secret, SMTP credentials).

5. **Seed admin user:**
   ```bash
   cd server
   npm run seed
   ```

6. **Start development servers:**
   ```bash
   # Terminal 1 — Backend (http://localhost:5000)
   cd server
   npm run dev

   # Terminal 2 — Frontend (http://localhost:5173)
   cd client
   npm run dev
   ```

## Project Structure

```
event-booking-system/
├── server/
│   ├── config/            # Database & environment configuration
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/       # Request handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── organizerController.js
│   │   ├── registrationController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middlewares/        # Express middlewares
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── models/            # Mongoose schemas
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── User.js
│   ├── routes/            # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── organizerRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── templates/         # Email HTML templates
│   ├── uploads/           # Uploaded files (gitignored)
│   ├── utils/             # Utility functions
│   │   ├── AppError.js
│   │   ├── emailService.js
│   │   ├── generateToken.js
│   │   └── seed.js
│   ├── validators/        # Request validation rules
│   ├── .env.example
│   ├── index.js           # Server entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    # Route guards, ErrorBoundary, ScrollToTop
│   │   │   ├── layout/    # Navbar, Footer, MainLayout, AdminLayout, OrganizerLayout
│   │   │   ├── organizer/ # EventForm
│   │   │   └── ui/        # Reusable UI components (EventCard, Spinner, Modal, etc.)
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── hooks/         # Custom hooks (useDebounce, usePagination, etc.)
│   │   ├── pages/
│   │   │   ├── admin/     # Admin dashboard, users, events, registrations
│   │   │   ├── organizer/ # Organizer dashboard, CRUD, attendees, settings
│   │   │   ├── HomePage.jsx
│   │   │   ├── EventListPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   ├── MyTicketsPage.jsx
│   │   │   ├── TicketDetailPage.jsx
│   │   │   └── ...
│   │   ├── services/      # API service modules (Axios)
│   │   ├── utils/         # Helpers, formatters, constants
│   │   ├── App.jsx        # Router & layout setup
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars in production) | — |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SMTP_HOST` | SMTP server host | `smtp.office365.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP email address | — |
| `SMTP_PASS` | SMTP app password | — |
| `SMTP_FROM_NAME` | Sender display name | `EventBooking` |
| `UPLOAD_MAX_SIZE` | Max upload size in bytes | `5242880` (5MB) |
| `ADMIN_SEED_EMAIL` | Admin email for seed script | — |
| `ADMIN_SEED_PASSWORD` | Admin password for seed script | — |
| `ADMIN_SEED_NAME` | Admin display name for seed script | `Admin` |

## Security

The following security measures are implemented throughout the application:

- **Helmet** — Sets secure HTTP response headers with explicit CSP directives
- **CORS** — Restricts cross-origin requests to allowed frontend URL (never wildcard in production)
- **Rate Limiting** — Multiple tiers: global (100/15min), auth (10/15min), registration (20/15min), upload (10/15min), and confirmation-specific limits
- **MongoDB Sanitization** — Prevents NoSQL injection via custom `express-mongo-sanitize` middleware (Express 5 compatible)
- **Input Validation** — All endpoints validated with `express-validator` rules and centralized validation middleware
- **XSS Prevention** — HTML escaping utility for user-generated content in email templates via `escapeHtml()`
- **ReDoS Prevention** — Regex special characters escaped in search queries via `escapeRegex()`
- **Password Security** — Bcrypt hashing (salt rounds 12), login attempt tracking, account locking after 5 failed attempts
- **JWT Security** — Token-based auth with configurable expiration, `passwordChangedAt` token invalidation, minimum 32-char secret enforced in production
- **Mass Assignment Protection** — Only whitelisted fields destructured in every controller
- **User Enumeration Prevention** — Identical error messages for wrong email and wrong password on login
- **File Upload Security** — MIME type whitelist (JPEG, PNG, GIF, WebP), 5MB size limit, server-generated filenames, path traversal protection
- **Request Size Limiting** — JSON and URL-encoded body size restrictions (10kb)
- **Static File Security** — Directory listing disabled, dotfiles denied
- **Admin Self-Protection** — Cannot delete self, cannot change own role, last admin check enforced
- **Atomic Operations** — Race-condition-safe capacity management with `findOneAndUpdate` + `$expr`
- **Error Handling** — Centralized error handler that hides internal details (stack traces, field names) in production

For a comprehensive 35-item security audit checklist, see **STEP 18** in [`STEPS.md`](STEPS.md).

## License

This project is licensed under the [MIT License](LICENSE).
