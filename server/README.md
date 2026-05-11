# CodeWithKasa - Server

This is the backend application of **CodeWithKasa**, a full-stack Learning Management System built with **NestJS**, **Node.js**, **TypeScript**, and **PostgreSQL**.

The server handles authentication, authorization, users, courses, lessons, orders, coupons, refunds, exams, progress tracking, roles, permissions, logs, and complete LMS business logic.

---

## Backend Overview

The backend follows a modular NestJS architecture. Each major feature is managed using dedicated modules, controllers, services, DTOs, guards, and business logic layers.

It provides REST APIs for the frontend client and powers the complete LMS platform.

---

## Features

### Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Role-based access control
- Protected APIs
- Admin, Faculty, and Student roles
- Guards for protected routes
- Secure token-based access

---

### User Management

- Manage students
- Manage faculty
- Manage admins
- Update user details
- Role-based user permissions
- User status management
- Profile-related APIs

---

### Course Management

- Create courses
- Update courses
- Delete courses
- View courses
- Manage course details
- Manage course content
- Course category handling
- Faculty-course handling
- Course review support

---

### Lesson & Learning Management

- Create lessons
- Update lessons
- Delete lessons
- Manage course-wise lessons
- Track lesson completion
- Control lesson access after purchase
- Maintain learning progress
- Track course completion

---

### Orders & Purchase System

- Course purchase handling
- Order creation
- Order records
- User-wise purchased courses
- Purchase history
- Admin order monitoring
- Refund-related management

---

### Coupon System

- Create coupons
- Update coupons
- Validate coupons
- Apply discounts
- Manage coupon status
- Track coupon usage

---

### Exam System

- Create exams
- Manage exam questions
- Student exam attempts
- Result calculation
- Exam history
- Student-wise result tracking

---

### Role & Permission System

- Role management
- Permission management
- Role-permission mapping
- Admin-level access control
- Protected API access using guards

---

### Content Management

- Article/blog management
- Single article data
- Category management
- Tags management
- Testimonials management
- Contact leads management
- Email templates management
- Site settings management

---

### Logs & Activity

- User activity logs
- Purchase/order logs
- Learning logs
- Admin monitoring logs
- Platform history records
- System activity tracking

---

## Tech Stack

- NestJS
- Node.js
- TypeScript
- PostgreSQL
- JWT Authentication
- REST API Architecture
- Guards
- DTOs
- Pipes
- Modules
- Controllers
- Services
- Role-Based Access Control

---

## Folder Structure

```txt
server/
  src/
    auth/
    users/
    courses/
    lessons/
    categories/
    orders/
    purchases/
    coupons/
    refunds/
    exams/
    progress/
    reviews/
    articles/
    contact/
    testimonials/
    email-templates/
    roles/
    permissions/
    settings/
    logs/
    common/
    main.ts
    app.module.ts
  package.json
  README.md
```

> Folder names may vary depending on the actual project structure.

---

## Installation

```bash
cd server
npm install
```

---

## Run Development Server

```bash
npm run start:dev
```

Server will run on:

```txt
http://localhost:5000
```

---

## Build for Production

```bash
npm run build
```

---

## Start Production Server

```bash
npm run start:prod
```

---

## Environment Variables

Create a `.env` file inside the `server/` folder.

```env
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=codewithkasa

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
```

Also keep a public example file:

```env
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=codewithkasa

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
```

File name:

```txt
server/.env.example
```

---

## API Modules

Main API modules:

```txt
/api/auth
/api/users
/api/courses
/api/lessons
/api/categories
/api/orders
/api/purchases
/api/coupons
/api/refunds
/api/exams
/api/progress
/api/reviews
/api/articles
/api/contact
/api/testimonials
/api/email-templates
/api/roles
/api/permissions
/api/settings
/api/logs
/api/admin
/api/faculty
/api/student
```

---

## Role-Based Access

### Student Access

Students can:

- View courses
- Purchase courses
- Access purchased courses
- Watch lessons
- Track progress
- Attempt exams
- View purchase history
- View exam results
- Manage profile

---

### Faculty Access

Faculty can:

- Manage assigned courses
- Manage lessons
- Manage course content
- Manage exams
- Track student progress
- View course-related activity

---

### Admin Access

Admin can:

- Manage users
- Manage students
- Manage faculty
- Manage courses
- Manage lessons
- Manage orders
- Manage purchases
- Manage coupons
- Manage refunds
- Manage exams
- Manage categories
- Manage articles
- Manage testimonials
- Manage contact leads
- Manage email templates
- Manage roles
- Manage permissions
- Manage site settings
- Manage logs
- View platform activity

---

## API Testing

You can test APIs using:

- Postman
- Thunder Client
- Insomnia

Base URL:

```txt
http://localhost:5000
```

---

## Production Notes

Before deployment:

- Set production PostgreSQL database credentials.
- Set a strong JWT secret.
- Configure CORS for the deployed frontend URL.
- Never expose `.env` files.
- Use HTTPS in production.
- Check all protected routes.
- Verify role-based guards.
- Test auth, courses, orders, coupons, exams, progress, roles, permissions, and admin APIs.

---

## Important Notes

- Do not push `.env` files to GitHub.
- Do not push `node_modules`.
- Keep modules clean and separated.
- Keep DTOs and validations organized.
- Keep guards and role checks properly applied.
- Keep database credentials private.
- Use `.env.example` for public reference.
- Keep business logic inside services.
- Keep route handlers clean inside controllers.

---

## Related Screenshots

Frontend and dashboard screenshots are available in the root `screenshots/` folder:

```txt
../screenshots/admin-dashboard-light-1.jpg
../screenshots/orders-dashboard.jpg
../screenshots/coupons-dashboard.jpg
../screenshots/refunds-dashboard.jpg
../screenshots/role-management-dashboard.jpg
../screenshots/roles-permission-dashboard.jpg
../screenshots/permission-library-dashboard.jpg
../screenshots/site-settings-dashboard-1.jpg
```

---

## Author

**Satendra Kanak**

GitHub: [@satendrakanak](https://github.com/satendrakanak)
