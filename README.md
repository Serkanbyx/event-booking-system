# 🎫 Event Booking System

A full-stack event booking platform built with the **MERN** stack (MongoDB, Express, React, Node.js). Features role-based access control (Attendee, Organizer, Admin), real-time capacity management with atomic operations, email confirmations via Outlook SMTP, QR code-based printable tickets, and a security-hardened REST API with multi-tier rate limiting.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

---

## Features

- **Role-Based Access Control** — Three distinct roles (Attendee, Organizer, Admin) with granular permissions and route guards
- **JWT Authentication** — Secure token-based auth with bcrypt hashing, login attempt limiting, and account locking
- **Full Event Lifecycle** — Draft → Published → Cancelled/Completed status workflow with slug-based SEO-friendly URLs
- **Atomic Capacity Management** — Race-condition-safe registration using MongoDB `findOneAndUpdate` + `$expr` to prevent overbooking
- **Email Notifications** — Automated confirmation and cancellation emails via Outlook SMTP with HTML templates
- **QR Code Tickets** — Unique UUID-based confirmation codes with printable ticket view and QR code generation
- **Organizer Dashboard** — Event statistics, attendee management, check-in system, revenue tracking, and upcoming events overview
- **Admin Panel** — System-wide dashboard with user management, event moderation, and registration oversight
- **Image Upload** — Multer-based file upload with MIME type validation, size limits, and server-generated filenames
- **Dark Mode** — System/light/dark theme support with persistent preference storage
- **Responsive Design** — Mobile-first layout with Tailwind CSS utility classes across all pages
- **Security Hardened** — Helmet, CORS, multi-tier rate limiting, MongoDB sanitization, input validation, XSS prevention

---

## Live Demo

[🚀 View Live Demo](https://event-booking-systemm.netlify.app/)

---

## Screenshots

![Home Page](screenshots/home.png)
![Event List](screenshots/event-list.png)
![Event Detail](screenshots/event-detail.png)
![My Tickets](screenshots/my-tickets.png)
![Organizer Dashboard](screenshots/organizer-dashboard.png)
![Admin Panel](screenshots/admin-panel.png)

---

## Technologies

### Frontend

- **React 19** — Modern UI library with hooks and context for state management
- **React Router DOM** — Client-side routing with nested layouts and route guards
- **Tailwind CSS 4** — Utility-first CSS framework with dark mode support
- **Vite** — Lightning-fast build tool and dev server with HMR
- **Axios** — Promise-based HTTP client with interceptors
- **qrcode.react** — QR code generation for printable tickets
- **React Hot Toast** — Elegant toast notifications
- **date-fns** — Lightweight date utility library

### Backend

- **Node.js** — Server-side JavaScript runtime
- **Express.js** — Minimal and flexible web application framework
- **MongoDB (Mongoose)** — NoSQL database with elegant object modeling and compound indexes
- **JWT (jsonwebtoken + bcryptjs)** — Stateless authentication with secure password hashing
- **Nodemailer** — Email sending via Outlook SMTP with HTML templates
- **Multer** — Multipart form data handling for file uploads
- **Helmet** — Secure HTTP response headers with CSP
- **express-rate-limit** — Multi-tier request rate limiting
- **express-validator** — Declarative input validation and sanitization
- **express-mongo-sanitize** — NoSQL injection prevention
- **Morgan** — HTTP request logging

---

## Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or local instance

### Local Development

**1. Clone the repository:**

```bash
git clone https://github.com/Serkanbyx/event-booking-system.git
cd event-booking-system
```

**2. Set up environment variables:**

```bash
cp server/.env.example server/.env
```

**server/.env**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-generated-app-password
SMTP_FROM_NAME=EventBooking
UPLOAD_MAX_SIZE=5242880
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=your_admin_password
ADMIN_SEED_NAME=Admin
```

> In development mode, emails are logged to the console if SMTP credentials are not configured.

**client/.env** (optional — Vite proxy handles `/api` in dev)

```env
VITE_API_URL=http://localhost:5000/api
```

**3. Install dependencies:**

```bash
cd server && npm install
cd ../client && npm install
```

**4. Seed admin user:**

```bash
cd server
npm run seed
```

**5. Run the application:**

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

---

## Usage

1. **Register** an account at `/auth/register` as an Attendee
2. **Browse events** on the homepage or `/events` with search, filter, and pagination
3. **View event details** by clicking on any event card
4. **Register for an event** — receive a confirmation email with a unique code
5. **View your tickets** at `/tickets` with QR codes and printable ticket view
6. **Organizers** can create, edit, publish, and cancel events from the Organizer Dashboard
7. **Admins** can manage users, moderate events, and oversee registrations from the Admin Panel

---

## Roles & Permissions

| Feature | Attendee | Organizer | Admin |
| --- | --- | --- | --- |
| Browse events | ✅ | ✅ | ✅ |
| Register for events | ✅ | ✅ | ✅ |
| View tickets | ✅ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Manage events | ❌ | Own only | All |
| View attendees | ❌ | Own events | All |
| Check-in attendees | ❌ | Own events | All |
| Manage users | ❌ | ❌ | ✅ |
| System dashboard | ❌ | ❌ | ✅ |

---

## How It Works?

### Authentication Flow

1. User registers or logs in → server generates a JWT token
2. Token is stored in `localStorage` and sent via `Authorization: Bearer <token>` header
3. `AuthContext` calls `/api/auth/me` on mount to restore the session
4. Protected routes check authentication and role via route guard components (`ProtectedRoute`, `OrganizerRoute`, `AdminRoute`)
5. Failed login attempts are tracked; account locks after 5 consecutive failures

### Registration Flow

1. User clicks "Register" on an event detail page
2. Server performs an atomic `findOneAndUpdate` with `$expr` to check capacity and increment `registeredCount` in a single operation — preventing race conditions
3. A `Registration` document is created with a unique UUID-based confirmation code
4. Confirmation email is sent via Outlook SMTP with an HTML template
5. User can view their ticket with QR code at `/tickets/:id`

### Architecture

```
Client (React + Vite)         Server (Express + MongoDB)
┌─────────────────────┐       ┌──────────────────────────┐
│  AuthContext         │       │  Middleware Stack         │
│  ThemeContext         │       │  ├── Helmet (CSP)        │
│  Pages + Components  │──────▶│  ├── CORS                │
│  Services (Axios)    │◀──────│  ├── Rate Limiters        │
│  Route Guards        │       │  ├── Mongo Sanitize       │
└─────────────────────┘       │  └── Auth (JWT)           │
                              │  Controllers → Models     │
                              │  Email Service (SMTP)     │
                              └──────────────────────────┘
```

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Server health check |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update user profile |
| PUT | `/api/auth/change-password` | Yes | Change password |
| DELETE | `/api/auth/delete-account` | Yes | Delete own account |

### Events (`/api/events`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/events` | No | List events (search, filter, paginate) |
| GET | `/api/events/featured` | No | Get featured events |
| GET | `/api/events/categories` | No | Get event categories |
| GET | `/api/events/id/:id` | No | Get event by ID |
| GET | `/api/events/:slug` | No | Get event by slug |
| POST | `/api/events` | Organizer | Create a new event |
| PUT | `/api/events/:id` | Organizer | Update own event |
| DELETE | `/api/events/:id` | Organizer | Delete own event |
| PUT | `/api/events/:id/publish` | Organizer | Publish a draft event |
| PUT | `/api/events/:id/cancel` | Organizer | Cancel an event |
| GET | `/api/events/:id/registrations` | Organizer | Get event registrations |
| GET | `/api/events/:id/stats` | Organizer | Get event statistics |
| POST | `/api/events/:id/register` | Yes | Register for an event |
| GET | `/api/events/my/organized` | Organizer | Get own organized events |

### Registrations (`/api/registrations`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/registrations/my` | Yes | Get own registrations |
| GET | `/api/registrations/code/:code` | Yes | Find by confirmation code |
| GET | `/api/registrations/:id` | Yes | Get registration details |
| PUT | `/api/registrations/:id/check-in` | Organizer | Check-in an attendee |
| DELETE | `/api/registrations/:id` | Yes | Cancel a registration |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/users/me/stats` | Yes | Get own statistics |
| GET | `/api/users/:id/profile` | No | Get public user profile |
| GET | `/api/users/:id/organizer` | No | Get organizer profile |

### Organizer (`/api/organizer`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/organizer/dashboard` | Organizer | Dashboard statistics |
| GET | `/api/organizer/revenue` | Organizer | Revenue breakdown |
| GET | `/api/organizer/recent-registrations` | Organizer | Recent registrations |
| GET | `/api/organizer/upcoming-events` | Organizer | Upcoming events list |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
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

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/upload/image` | Organizer | Upload an event image |
| DELETE | `/api/upload/:filename` | Organizer | Delete an uploaded image |

> Auth endpoints require `Authorization: Bearer <token>` header. Rate limits apply per tier: global (100/15min), auth (10/15min), registration (20/15min), upload (10/15min).

---

## Project Structure

```
event-booking-system/
├── client/                          # React frontend
│   ├── public/
│   │   └── _redirects               # Netlify SPA fallback
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Route guards, ErrorBoundary, ScrollToTop
│   │   │   ├── layout/              # Navbar, Footer, MainLayout, OrganizerLayout, AdminLayout
│   │   │   ├── organizer/           # EventForm
│   │   │   └── ui/                  # EventCard, Spinner, Modal, StatusBadge, CapacityBar, etc.
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # JWT auth state and token management
│   │   │   └── ThemeContext.jsx     # Light/dark/system theme persistence
│   │   ├── hooks/                   # useDebounce, usePagination, useLocalStorage, useDocumentTitle
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboard, AdminUsers, AdminEvents, AdminRegistrations
│   │   │   ├── organizer/           # OrganizerDashboard, CreateEvent, EditEvent, Attendees, Settings
│   │   │   ├── HomePage.jsx         # Landing page with featured events
│   │   │   ├── EventListPage.jsx    # Browse events with search and filters
│   │   │   ├── EventDetailPage.jsx  # Single event with registration
│   │   │   ├── MyTicketsPage.jsx    # User's tickets list
│   │   │   ├── TicketDetailPage.jsx # Ticket with QR code and print
│   │   │   ├── LoginPage.jsx        # User login
│   │   │   ├── RegisterPage.jsx     # User registration
│   │   │   ├── SettingsPage.jsx     # User profile settings
│   │   │   ├── PublicProfilePage.jsx # Public user/organizer profile
│   │   │   └── NotFoundPage.jsx     # 404 page
│   │   ├── services/                # API modules (auth, event, registration, user, organizer, admin, upload)
│   │   ├── utils/                   # helpers, formatters, constants
│   │   ├── App.jsx                  # Router and layout setup
│   │   ├── main.jsx                 # React entry point with providers
│   │   └── index.css                # Global styles and Tailwind directives
│   ├── index.html
│   ├── netlify.toml                 # Netlify deployment config
│   ├── vite.config.js               # Vite config with API proxy
│   └── package.json
│
├── server/                          # Express backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── env.js                   # Environment variable validation
│   ├── controllers/                 # Route handlers (auth, event, registration, user, organizer, admin, upload)
│   ├── middlewares/
│   │   ├── auth.js                  # JWT protect, optionalAuth, role guards
│   │   ├── errorHandler.js          # Centralized error handling
│   │   ├── rateLimiter.js           # Multi-tier rate limiters
│   │   ├── upload.js                # Multer config with MIME validation
│   │   └── validate.js              # express-validator middleware
│   ├── models/
│   │   ├── User.js                  # User schema with roles and login tracking
│   │   ├── Event.js                 # Event schema with slug, capacity, status workflow
│   │   └── Registration.js          # Registration schema with UUID confirmation codes
│   ├── routes/                      # API route definitions (7 route files)
│   ├── templates/                   # HTML email templates (confirmation, cancellation)
│   ├── uploads/                     # Uploaded files directory (gitignored)
│   ├── utils/
│   │   ├── AppError.js              # Custom error class
│   │   ├── emailService.js          # Nodemailer SMTP service
│   │   ├── escapeHtml.js            # XSS prevention utility
│   │   ├── escapeRegex.js           # ReDoS prevention utility
│   │   ├── generateToken.js         # JWT token generator
│   │   └── seed.js                  # Admin user and sample data seeder
│   ├── validators/                  # Validation rules (auth, event, registration, query, param, admin)
│   ├── .env.example                 # Environment variable template
│   ├── index.js                     # Server entry point
│   └── package.json
│
└── README.md
```

---

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
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

---

## Email Setup (Outlook SMTP)

1. Go to [Microsoft Account Security](https://account.microsoft.com/security) → **App passwords**
2. Generate a new app password for "Event Booking System"
3. Configure the SMTP environment variables in `server/.env`
4. The server verifies the SMTP connection on startup and logs the result
5. In development mode, emails are logged to console if SMTP credentials are not configured

---

## Security

- **Helmet** — Sets secure HTTP response headers with explicit CSP directives in production
- **CORS** — Restricts cross-origin requests to the allowed frontend URL (never wildcard in production)
- **Rate Limiting** — Multiple tiers: global (100/15min), auth (10/15min), registration (20/15min), upload (10/15min), and confirmation-specific limits
- **MongoDB Sanitization** — Prevents NoSQL injection via `express-mongo-sanitize` middleware (Express 5 compatible)
- **Input Validation** — All endpoints validated with `express-validator` rules and centralized validation middleware
- **XSS Prevention** — HTML escaping utility for user-generated content in email templates
- **ReDoS Prevention** — Regex special characters escaped in search queries via `escapeRegex()`
- **Password Security** — Bcrypt hashing (salt rounds 12), login attempt tracking, account locking after 5 failed attempts
- **JWT Security** — Token-based auth with configurable expiration, `passwordChangedAt` invalidation, minimum 32-char secret enforced in production
- **Mass Assignment Protection** — Only whitelisted fields destructured in every controller
- **User Enumeration Prevention** — Identical error messages for wrong email and wrong password on login
- **File Upload Security** — MIME type whitelist (JPEG, PNG, GIF, WebP), 5MB size limit, server-generated filenames, path traversal protection
- **Request Size Limiting** — JSON and URL-encoded body size restrictions (10kb)
- **Static File Security** — Directory listing disabled, dotfiles denied
- **Admin Self-Protection** — Cannot delete self, cannot change own role, last admin check enforced
- **Atomic Operations** — Race-condition-safe capacity management with `findOneAndUpdate` + `$expr`
- **Error Handling** — Centralized error handler that hides internal details (stack traces, field names) in production

---

## Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to [Netlify](https://www.netlify.com/)
2. Set build settings:

| Setting | Value |
| --- | --- |
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |

3. Add environment variable:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://your-backend-url.com/api` |

> The `netlify.toml` and `_redirects` files are already configured for SPA routing.

### Backend (Render / Railway)

1. Create a new Web Service on [Render](https://render.com/) or [Railway](https://railway.app/)
2. Set the root directory to `server`
3. Configure:

| Setting | Value |
| --- | --- |
| Build command | `npm install` |
| Start command | `npm start` |

4. Add all environment variables from the table above
5. Set `CLIENT_URL` to your Netlify frontend URL

---

## Features in Detail

**Completed Features:**

- ✅ JWT authentication with role-based access control
- ✅ Full event CRUD with draft/publish/cancel workflow
- ✅ Atomic registration with race-condition prevention
- ✅ Email notifications (confirmation, cancellation, event cancelled)
- ✅ QR code tickets with printable view
- ✅ Organizer dashboard with analytics and check-in
- ✅ Admin panel with user/event/registration management
- ✅ Dark mode with system preference detection
- ✅ Responsive design across all pages
- ✅ Image upload with validation
- ✅ Multi-tier rate limiting and security hardening
- ✅ Search, filter, and pagination with debounced queries
- ✅ SEO-friendly slug-based event URLs

**Future Features:**

- 🔮 [ ] Payment integration (Stripe/PayPal)
- 🔮 [ ] Real-time notifications with WebSocket
- 🔮 [ ] Calendar integration (Google Calendar, iCal)
- 🔮 [ ] Social sharing for events
- 🔮 [ ] Event comments and reviews
- 🔮 [ ] Analytics dashboard with charts

---

## Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes following the convention below
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

| Prefix | Description |
| --- | --- |
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code refactoring |
| `docs:` | Documentation changes |
| `style:` | Formatting, missing semicolons, etc. |
| `chore:` | Maintenance and dependency updates |

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Developer

**Serkan Bayraktar**

- 🌐 [serkanbayraktar.com](https://serkanbayraktar.com/)
- 🐙 [@Serkanbyx](https://github.com/Serkanbyx)
- 📧 serkanbyx1@gmail.com

---

## Contact

- 🐛 [Report a Bug](https://github.com/Serkanbyx/event-booking-system/issues)
- 📧 serkanbyx1@gmail.com
- 🌐 [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
