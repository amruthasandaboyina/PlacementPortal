# Placement Portal – Problem Analysis & Requirements

## Problem
College placement activities are often managed through separate spreadsheets, messages and manual records. This makes job discovery, eligibility checking, application tracking and recruiter coordination difficult.

## Objective
Build one web portal that connects students, recruiters and the placement cell and stores placement data in MySQL.

## Functional requirements
- Student registration/login and profile management
- Company registration/login and job posting
- Job search and eligibility checking
- Online applications and status tracking
- Recruiter applicant review and shortlisting
- Admin statistics and user monitoring
- JWT-based authentication and role-based authorization

## Non-functional requirements
- Responsive UI for desktop/mobile
- Input validation and clear error messages
- Secure password hashing
- REST API architecture
- Relational MySQL database
- Maintainable folder structure and documentation

## Main actors
**Student:** creates profile, searches jobs, checks eligibility, applies and tracks status.

**Company/Recruiter:** creates jobs, views applicants and updates application outcomes.

**Placement Officer/Admin:** monitors users, jobs, applications and placement statistics.

## Responsive wireframe description
**Desktop:** top navigation → hero → job cards → dashboard cards/tables → footer.

**Mobile:** stacked navigation/actions → single-column cards/forms → horizontally scrollable data tables.

## Technology flow
HTML + CSS + Bootstrap + JavaScript → Express.js REST API → MySQL
