CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','company','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  roll_no VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  cgpa DECIMAL(4,2) DEFAULT 0,
  graduation_year INT DEFAULT 2027,
  skills VARCHAR(500) DEFAULT '',
  resume VARCHAR(255) DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(150) NOT NULL,
  industry VARCHAR(100) DEFAULT '',
  location VARCHAR(150) DEFAULT '',
  website VARCHAR(255) DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  package_lpa DECIMAL(8,2) DEFAULT 0,
  location VARCHAR(150) DEFAULT '',
  min_cgpa DECIMAL(4,2) DEFAULT 0,
  eligible_department VARCHAR(100) DEFAULT 'All',
  deadline DATE,
  status ENUM('open','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('Applied','Shortlisted','Interview','Selected','Rejected') DEFAULT 'Applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (job_id, student_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Demo admin login: admin@placement.edu / admin123
-- Demo student login: student@placement.edu / student123
-- Demo company login: hr@techcorp.com / company123
