# CodeWithKasa - Client

This is the frontend application of **CodeWithKasa**, a full-stack Learning Management System built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**.

The client handles the complete user interface for students, faculty, and admins.

---

## Preview

### Home Page

![Home Page](../screenshots/home-page-1.jpg)

### User Dashboard

![User Dashboard](../screenshots/user-dashboard-page-1.jpg)

### Admin Dashboard

![Admin Dashboard](../screenshots/admin-dashboard-light-1.jpg)

### Courses Dashboard

![Courses Dashboard](../screenshots/courses-dashboard.jpg)

### Single Course Page

![Single Course Page](../screenshots/single-course-page-1.jpg)

### Learning Player

![Learning Player](../screenshots/learn-screen-player.jpg)

### Orders Dashboard

![Orders Dashboard](../screenshots/orders-dashboard.jpg)

### Role Management

![Role Management](../screenshots/role-management-dashboard.jpg)

---

## Frontend Overview

The frontend provides a modern, responsive, role-based LMS interface. It includes public pages, authentication pages, student dashboard pages, admin dashboard pages, course pages, learning screens, article pages, and management dashboards.

The UI is designed to support different user roles with protected routes and separate dashboard experiences.

---

## Features

### Public Pages

- Home page
- Course listing
- Course details page
- Articles page
- Single article page
- Contact page
- Testimonials section
- Responsive layout

---

### Student UI

- Student login and registration
- User dashboard
- Profile page
- Settings page
- Browse courses
- View course details
- Purchase courses
- Access purchased courses
- Watch course lessons
- Learning player
- Course overview screen
- Course exams screen
- Course reviews screen
- Track learning progress
- View certificates
- View purchase/order history

---

### Admin UI

- Admin dashboard
- Courses dashboard
- Course create/edit pages
- Categories dashboard
- Orders dashboard
- Coupons dashboard
- Refunds dashboard
- Role management dashboard
- Roles-permission dashboard
- Permission library dashboard
- Course reviews dashboard
- Contact leads dashboard
- Client testimonials dashboard
- Email templates dashboard
- Site settings dashboard
- Tags dashboard
- Articles management pages

---

### Faculty UI

- Faculty dashboard
- Assigned course management
- Lesson/content management
- Exam management
- Student progress view
- Course review visibility

---

### Authentication & Authorization UI

- Login pages
- Register pages
- Token-based frontend auth
- Role-based redirects
- Protected dashboard routes
- Separate UI handling for Admin, Faculty, and Student

---

## Tech Stack

- Next.js
- React.js
- TypeScript
- Tailwind CSS
- Axios
- Component-based architecture
- Responsive UI
- Role-based protected routes
- Dashboard-based layout system

---

## Folder Structure

```txt
client/
  app/ or pages/
  components/
  hooks/
  lib/
  services/
  utils/
  public/
  package.json
  README.md
```

> Folder names may vary depending on the actual project structure.

---

## Installation

```bash
cd client
npm install
```

---

## Run Development Server

```bash
npm run dev
```

Client will run on:

```txt
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

---

## Start Production Build

```bash
npm start
```

---

## Environment Variables

Do not create env files inside `client/`. Development uses the root
`.env.development` file, and production uses the root `.env` file. Docker passes
the required public variables into the client container.

---

## Backend Connection

The frontend communicates with the backend API using:

```env
NEXT_PUBLIC_API_BASE_URL
```

Make sure the backend server is running before testing API-based pages such as login, dashboard, orders, coupons, course purchase, exams, progress, and admin modules.

---

## Main Frontend Sections

```txt
Home
Courses
Single Course
Articles
Single Article
Contact
Login
Register
User Dashboard
Admin Dashboard
Courses Dashboard
Course Edit
Learning Player
Learning Overview
Learning Exams
Learning Reviews
Orders
Coupons
Refunds
Roles
Permissions
Categories
Testimonials
Contact Leads
Email Templates
Site Settings
Tags
```

---

## Screenshot References

```txt
../screenshots/home-page-1.jpg
../screenshots/home-page-2.jpg
../screenshots/articles-page.jpg
../screenshots/single-article-page.jpg
../screenshots/contact-us-page.jpg

../screenshots/user-dashboard.jpg
../screenshots/user-dashboard-page-1.jpg
../screenshots/user-dashboard-profile-page.jpg
../screenshots/user-dashboard-settings-pgae.jpg
../screenshots/user-dashboard-certificate-page.jpg

../screenshots/admin-dashboard-light-1.jpg
../screenshots/admin-dashboard-dark.jpg
../screenshots/courses-dashboard.jpg
../screenshots/orders-dashboard.jpg
../screenshots/coupons-dashboard.jpg
../screenshots/role-management-dashboard.jpg
../screenshots/permission-library-dashboard.jpg
```

---

## Important Notes

- Do not push `.env` files to GitHub.
- Do not push `node_modules`.
- Do not push `.next`.
- Keep reusable components organized.
- Keep API calls inside service/helper files.
- Keep dashboard sections separated by role.
- Keep protected routes properly handled.
- Keep UI responsive for different screen sizes.

---

## Author

**Satendra Kanak**

GitHub: [@satendrakanak](https://github.com/satendrakanak)
