# Deployment Guide

## Before deployment
1. Push the project to GitHub.
2. Do **not** upload `.env`; it is ignored by `.gitignore`.
3. Create a hosted MySQL database with a provider that supplies a MySQL connection host, user, password and database name.

## Node.js hosting
Use any Node.js hosting provider that supports an Express web service. Set the start command to:
```text
npm start
```
Set environment variables in the hosting dashboard:
```text
DB_HOST=<hosted mysql host>
DB_USER=<hosted mysql user>
DB_PASSWORD=<hosted mysql password>
DB_NAME=<hosted mysql database>
JWT_SECRET=<long random secret>
PORT=<provider supplied port or 5000>
```

## Database
Run `database/placement_portal.sql` against the hosted MySQL database, then run the seed script if demo data is required:
```bash
node seed.js
```

## Verification
Open `/api/health`. A successful response should contain database `connected`. Then open the public service URL and test student, company and admin flows.

## College submission
Include the public URL, GitHub repository, screenshots, database schema, API/Postman evidence and this documentation in the hard-copy report.
