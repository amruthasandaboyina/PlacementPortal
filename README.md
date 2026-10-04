# CampusHire Placement Portal

A college Placement Portal prototype built with **HTML, CSS, JavaScript, Bootstrap 5, Node.js, Express.js and MySQL**.

## Features
- Student, Company/Recruiter and Admin roles
- Responsive Bootstrap + custom CSS UI
- Client-side and server-side validation
- ES6 JavaScript using arrow functions, Promises/fetch and async/await
- MySQL database with CRUD-oriented REST APIs
- JWT authentication with 8-hour token expiry
- Job search, eligibility checking and online applications
- Recruiter shortlisting/status updates
- Admin placement statistics
- Postman collection and documentation

## Q1-Q10 Requirement Coverage
1. Problem analysis & requirement specification → `docs/requirements.md`
2. Wireframes & responsive HTML/CSS UI → responsive custom CSS UI
3. Bootstrap responsive layouts → Bootstrap 5 CDN + responsive Bootstrap grid/components
4. Client-side validation → JavaScript validation + HTML validation attributes
5. ES6 features → arrow functions, fetch Promises and async/await in `frontend/js/app.js`
6. Database schema & CRUD APIs → `database/placement_portal.sql` + Express APIs
7. Express.js REST API → `backend/server.js`
8. JWT authentication/session handling → JWT Bearer tokens with expiry and role checks
9. Frontend/backend integration & Postman testing → `docs/postman_collection.json`
10. Deployment/documentation → `docs/DEPLOYMENT.md` and this README

## Run locally
```bash
npm install
```
Create `.env` from `.env.example`, set your MySQL password, then run `database/placement_portal.sql`.

Seed demo data:
```bash
node seed.js
```
Start:
```bash
npm start
```
Open `http://localhost:5000`.

## Demo accounts
- Admin: `admin@placement.edu` / `admin123`
- Student: `student@placement.edu` / `student123`
- Company: `hr@techcorp.com` / `company123`

## Important security note
Never commit `.env`. It contains the database password. Use `.env.example` as the safe template.

## API endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `PUT /api/students/profile`
- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/jobs/:id/apply`
- `GET /api/applications/me`
- `GET /api/company/applicants`
- `PUT /api/applications/:id/status`
- `GET /api/admin/stats`
- `GET /api/admin/users`
