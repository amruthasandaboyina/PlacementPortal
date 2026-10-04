const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "placement_portal_secret";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "8h" });
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Login required" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function role(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "Access denied" });
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ message: "Placement Portal API is running", database: "connected" });
  } catch (e) {
    res.status(500).json({ message: "API running but database connection failed" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role: userRole, rollNo, department, cgpa, graduationYear, skills, companyName, industry, location, website } = req.body;
    if (!name || !email || !password || !["student","company"].includes(userRole))
      return res.status(400).json({ message: "Name, email, password and valid role are required" });

    const [exists] = await db.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
      [name, email, hash, userRole]);

    if (userRole === "student") {
      if (!rollNo || !department) return res.status(400).json({ message: "Roll number and department are required" });
      await db.query(
        "INSERT INTO students(user_id,roll_no,department,cgpa,graduation_year,skills) VALUES(?,?,?,?,?,?)",
        [result.insertId, rollNo, department, Number(cgpa || 0), Number(graduationYear || 2027), skills || ""]
      );
    } else {
      await db.query(
        "INSERT INTO companies(user_id,company_name,industry,location,website) VALUES(?,?,?,?,?)",
        [result.insertId, companyName || name, industry || "", location || "", website || ""]
      );
    }
    res.status(201).json({ message: "Registration successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT id,name,email,password,role FROM users WHERE email=?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/profile", auth, async (req, res) => {
  try {
    if (req.user.role === "student") {
      const [r] = await db.query(
        `SELECT u.id,u.name,u.email,s.id AS student_id,s.roll_no,s.department,s.cgpa,s.graduation_year,s.skills,s.resume
         FROM users u JOIN students s ON s.user_id=u.id WHERE u.id=?`, [req.user.id]);
      return res.json(r[0]);
    }
    if (req.user.role === "company") {
      const [r] = await db.query(
        `SELECT u.id,u.name,u.email,c.id AS company_id,c.company_name,c.industry,c.location,c.website
         FROM users u JOIN companies c ON c.user_id=u.id WHERE u.id=?`, [req.user.id]);
      return res.json(r[0]);
    }
    res.json(req.user);
  } catch (e) { res.status(500).json({ message: "Could not load profile" }); }
});

app.put("/api/students/profile", auth, role("student"), async (req, res) => {
  const { name, rollNo, department, cgpa, graduationYear, skills, resume } = req.body;
  try {
    await db.query("UPDATE users SET name=? WHERE id=?", [name, req.user.id]);
    await db.query(
      "UPDATE students SET roll_no=?,department=?,cgpa=?,graduation_year=?,skills=?,resume=? WHERE user_id=?",
      [rollNo, department, Number(cgpa||0), Number(graduationYear||2027), skills||"", resume||"", req.user.id]
    );
    res.json({ message: "Profile updated" });
  } catch (e) { res.status(500).json({ message: "Profile update failed" }); }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const q = `%${req.query.q || ""}%`;
    const [rows] = await db.query(
      `SELECT j.*,c.company_name,c.industry,c.location AS company_location
       FROM jobs j JOIN companies c ON c.id=j.company_id
       WHERE j.title LIKE ? OR c.company_name LIKE ? OR j.location LIKE ?
       ORDER BY j.created_at DESC`, [q,q,q]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: "Could not load jobs" }); }
});

app.post("/api/jobs", auth, role("company"), async (req, res) => {
  try {
    const [c] = await db.query("SELECT id FROM companies WHERE user_id=?", [req.user.id]);
    if (!c.length) return res.status(400).json({ message: "Company profile not found" });
    const { title, description, packageLpa, location, minCgpa, eligibleDepartment, deadline } = req.body;
    const [r] = await db.query(
      `INSERT INTO jobs(company_id,title,description,package_lpa,location,min_cgpa,eligible_department,deadline)
       VALUES(?,?,?,?,?,?,?,?)`,
      [c[0].id,title,description||"",Number(packageLpa||0),location||"",Number(minCgpa||0),eligibleDepartment||"All",deadline||null]
    );
    res.status(201).json({ message: "Job posted", id: r.insertId });
  } catch (e) { res.status(500).json({ message: "Could not post job" }); }
});

app.delete("/api/jobs/:id", auth, role("company","admin"), async (req,res) => {
  try {
    if (req.user.role === "company") {
      const [c] = await db.query("SELECT id FROM companies WHERE user_id=?", [req.user.id]);
      await db.query("DELETE FROM jobs WHERE id=? AND company_id=?", [req.params.id,c[0]?.id]);
    } else await db.query("DELETE FROM jobs WHERE id=?", [req.params.id]);
    res.json({ message: "Job deleted" });
  } catch(e) { res.status(500).json({message:"Could not delete job"}); }
});

app.post("/api/jobs/:id/apply", auth, role("student"), async (req,res) => {
  try {
    const [s] = await db.query("SELECT id FROM students WHERE user_id=?", [req.user.id]);
    const [j] = await db.query("SELECT * FROM jobs WHERE id=? AND status='open'", [req.params.id]);
    if (!s.length || !j.length) return res.status(404).json({message:"Student or job not found"});
    const job=j[0];
    const [profile]=await db.query("SELECT * FROM students WHERE id=?", [s[0].id]);
    if (Number(profile[0].cgpa) < Number(job.min_cgpa) ||
        (job.eligible_department !== "All" && job.eligible_department !== profile[0].department))
      return res.status(400).json({message:"You are not eligible for this job"});
    await db.query("INSERT INTO applications(job_id,student_id) VALUES(?,?)",[job.id,s[0].id]);
    res.status(201).json({message:"Application submitted"});
  } catch(e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({message:"Already applied"});
    res.status(500).json({message:"Application failed"});
  }
});

app.get("/api/applications/me", auth, role("student"), async (req,res) => {
  try {
    const [rows]=await db.query(
      `SELECT a.*,j.title,j.package_lpa,j.location,c.company_name
       FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id
       JOIN students s ON s.id=a.student_id WHERE s.user_id=? ORDER BY a.applied_at DESC`,[req.user.id]);
    res.json(rows);
  } catch(e){res.status(500).json({message:"Could not load applications"});}
});

app.get("/api/company/applicants", auth, role("company"), async (req,res)=>{
  try{
    const [rows]=await db.query(
      `SELECT a.id AS application_id,a.status,a.applied_at,j.title,j.id AS job_id,
       s.id AS student_id,u.name,u.email,s.roll_no,s.department,s.cgpa,s.skills,s.resume
       FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id
       JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id
       WHERE c.user_id=? ORDER BY a.applied_at DESC`,[req.user.id]);
    res.json(rows);
  }catch(e){res.status(500).json({message:"Could not load applicants"});}
});

app.put("/api/applications/:id/status", auth, role("company","admin"), async(req,res)=>{
  try{
    const allowed=["Applied","Shortlisted","Interview","Selected","Rejected"];
    if(!allowed.includes(req.body.status)) return res.status(400).json({message:"Invalid status"});
    if(req.user.role==="company"){
      const [r]=await db.query(
        `SELECT a.id FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id
         WHERE a.id=? AND c.user_id=?`,[req.params.id,req.user.id]);
      if(!r.length)return res.status(403).json({message:"Not your applicant"});
    }
    await db.query("UPDATE applications SET status=? WHERE id=?",[req.body.status,req.params.id]);
    res.json({message:"Application status updated"});
  }catch(e){res.status(500).json({message:"Could not update status"});}
});

app.get("/api/admin/stats", auth, role("admin"), async(req,res)=>{
  try{
    const queries=[
      ["students","SELECT COUNT(*) n FROM students"],
      ["companies","SELECT COUNT(*) n FROM companies"],
      ["jobs","SELECT COUNT(*) n FROM jobs WHERE status='open'"],
      ["applications","SELECT COUNT(*) n FROM applications"],
      ["selected","SELECT COUNT(*) n FROM applications WHERE status='Selected'"],
      ["avgPackage","SELECT ROUND(AVG(package_lpa),2) n FROM jobs WHERE package_lpa>0"],
      ["highestPackage","SELECT MAX(package_lpa) n FROM jobs"]
    ];
    const out={};
    for(const [k,sql] of queries){const [r]=await db.query(sql);out[k]=r[0].n||0;}
    res.json(out);
  }catch(e){res.status(500).json({message:"Could not load statistics"});}
});

app.get("/api/admin/users", auth, role("admin"), async(req,res)=>{
  try{const [r]=await db.query("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC");res.json(r);}
  catch(e){res.status(500).json({message:"Could not load users"});}
});

app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/index.html"));
});

app.listen(PORT, async()=>{
  console.log(`Placement Portal running at http://localhost:${PORT}`);
  try{await db.query("SELECT 1"); console.log("MySQL connected successfully!");}
  catch(e){console.log("MySQL connection failed:",e.message);}
});
