# Backend Implementation TODO

- [ ] Update package.json: Add Express, nodemailer, cors, body-parser, express-session dependencies and update scripts
- [ ] Create server/server.js: Main Express server setup with middleware and static file serving
- [ ] Create server/routes/students.js: API endpoints for student registration, login, and retrieval
- [ ] Create server/routes/complaints.js: API endpoints for complaint CRUD operations (create, read, update status, delete)
- [ ] Create server/data/students.json: Initial empty JSON file for student data
- [ ] Create server/data/complaints.json: Initial empty JSON file for complaint data
- [ ] Update script.js: Replace localStorage with fetch API calls to backend endpoints
- [ ] Update student.html: Remove EmailJS script tag
- [ ] Add email functionality in server: Use nodemailer for sending emails on complaint submission and status updates
- [ ] Test the full system: Run server, test registration, login, complaint submission, admin updates
