const bcrypt=require("bcryptjs"), db=require("./backend/db");
(async()=>{
try{
const pass=async x=>await bcrypt.hash(x,10);
const users=[
["Placement Admin","admin@placement.edu",await pass("admin123"),"admin"],
["Demo Student","student@placement.edu",await pass("student123"),"student"],
["TechCorp HR","hr@techcorp.com",await pass("company123"),"company"]
];
for(const u of users){await db.query("INSERT IGNORE INTO users(name,email,password,role) VALUES(?,?,?,?)",u)}
const [[su]]=await db.query("SELECT id FROM users WHERE email='student@placement.edu'");
await db.query("INSERT IGNORE INTO students(user_id,roll_no,department,cgpa,graduation_year,skills) VALUES(?,?,?,?,?,?)",[su.id,"STU001","CSM",8.7,2027,"JavaScript, Java, SQL, React"]);
const [[cu]]=await db.query("SELECT id FROM users WHERE email='hr@techcorp.com'");
await db.query("INSERT IGNORE INTO companies(user_id,company_name,industry,location,website) VALUES(?,?,?,?,?)",[cu.id,"TechCorp Solutions","Software","Hyderabad","https://example.com"]);
const [[co]]=await db.query("SELECT id FROM companies WHERE user_id=?", [cu.id]);
const [jobs]=await db.query("SELECT id FROM jobs WHERE company_id=?",[co.id]);
if(!jobs.length) await db.query("INSERT INTO jobs(company_id,title,description,package_lpa,location,min_cgpa,eligible_department,deadline) VALUES(?,?,?,?,?,?,?,?)",[co.id,"Software Engineer","Build scalable web applications and APIs with a collaborative engineering team.",8.5,"Hyderabad",7.0,"All","2026-12-15"]);
console.log("Demo data ready.");
}catch(e){console.error(e)}finally{await db.end()}
})();