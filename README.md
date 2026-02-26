# Anurag Software Solutions - Company Management Portal

A full-stack role-based company management portal built with React + Node.js/Express + MongoDB.

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed    # Seeds demo users and services
npm run dev     # Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start       # Runs on http://localhost:3000
```

## Demo Login Credentials

| Role     | Email                   | Password  |
|----------|-------------------------|-----------|
| Admin    | admin@anuragtech.com    | admin123  |
| Employee | rahul@anuragtech.com    | emp123    |
| Employee | priya@anuragtech.com    | emp123    |
| Client   | amit@techcorp.com       | client123 |
| Client   | sunita@startupx.com     | client123 |

## Features

**Admin:** Dashboard stats, user management, project management, services, service request approval, messaging, profile
**Employee:** View assigned projects, update project status, messaging, profile  
**Client:** View projects, browse services, request services, track requests, messaging, profile

**Service Flow:** Client requests service -> Admin approves -> Project created automatically
