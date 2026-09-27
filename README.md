# SMMA Website

Social Media Marketing Agency management platform — full-stack web application built with Next.js, TypeScript, Prisma, and NextAuth.

## Features

- **Role-based dashboards** for Clients, Admins, and Social Media Managers
- **Complete workflows:** Quote → Proposal → Project → Tasks → Content → Invoice
- **Client portal:** Submit quotes, view projects, approve content, view invoices/reports, submit reviews
- **Admin panel:** Manage services, packages, portfolio, FAQ, quotes, projects, campaigns, invoices
- **SMM portal:** Assigned projects, task management, campaigns, content creation, timesheets
- **Real-time messaging** between clients and their assigned SMM
- **Notifications** for all major events
- **File uploads** for projects, tasks, and messages

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js (v5 beta)
- **Validation:** Zod

## Setup

1. Install Node.js v20+: https://nodejs.org
2. Install dependencies.
3. Generate Prisma client:
4. Run the dev server:
5. Open http://localhost:3000

## Test Accounts

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Client | client@test.com    | client123 |
| Admin  | admin@test.com     | admin123  |
| SMM    | smm@test.com       | smm12345  |
