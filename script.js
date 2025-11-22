// API base URL
const API_BASE = 'http://localhost:3000/api';

// Function to check if complaint is expired (older than 24 hours)
function isComplaintExpired(timestamp) {
    const now = new Date();
    const complaintTime = new Date(timestamp);
    const diffInMs = now - complaintTime;
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    return diffInMs > twentyFourHoursInMs;
}

// Function to render complaints for students
async function renderStudentComplaints() {
    const complaintsList = document.getElementById('my-complaints-list');
    if (!complaintsList) return;

    try {
        const response = await fetch(`${API_BASE}/complaints/my`);
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const studentComplaints = await response.json();

        complaintsList.innerHTML = '';

        if (studentComplaints.length === 0) {
            complaintsList.innerHTML = '<p>No complaints submitted yet.</p>';
            return;
        }

        studentComplaints.forEach(complaint => {
            const complaintDiv = document.createElement('div');
            complaintDiv.className = 'complaint-item';
            complaintDiv.innerHTML = `
                <h3>${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)} #${complaint.id}</h3>
                <p><strong>Description:</strong> ${complaint.description}</p>
                <p><strong>Status:</strong> <span class="status ${complaint.status}">${complaint.status.replace('-', ' ')}</span></p>
                <p><strong>Submitted:</strong> ${new Date(complaint.timestamp).toLocaleString()}</p>
            `;
            complaintsList.appendChild(complaintDiv);
        });
    } catch (error) {
        console.error('Error rendering student complaints:', error);
        complaintsList.innerHTML = '<p>Error loading complaints.</p>';
    }
}

// Function to update student stats
async function updateStudentStats() {
    try {
        const response = await fetch(`${API_BASE}/complaints/my`);
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const studentComplaints = await response.json();

        const total = studentComplaints.length;
        const pending = studentComplaints.filter(c => c.status === 'pending').length;
        const resolved = studentComplaints.filter(c => c.status === 'resolved').length;

        document.getElementById('total-complaints').textContent = total;
        document.getElementById('pending-complaints').textContent = pending;
        document.getElementById('resolved-complaints').textContent = resolved;
    } catch (error) {
        console.error('Error updating student stats:', error);
    }
}

// Function to show/hide sections based on login status
function checkLoginStatus() {
    const studentId = localStorage.getItem('currentStudentId');
    const studentName = localStorage.getItem('currentStudentName');

    if (studentId && studentName) {
        // Show portal sections
        document.getElementById('student-login').style.display = 'none';
        document.getElementById('student-dashboard').style.display = 'block';
        document.getElementById('submit-complaint').style.display = 'block';
        document.getElementById('my-complaints').style.display = 'block';

        // Populate name and stats
        document.getElementById('student-name').textContent = studentName;
        updateStudentStats();
        renderStudentComplaints();
    } else {
        // Show registration section
        document.getElementById('student-login').style.display = 'block';
        document.getElementById('student-dashboard').style.display = 'none';
        document.getElementById('submit-complaint').style.display = 'none';
        document.getElementById('my-complaints').style.display = 'none';
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('currentStudentId');
    localStorage.removeItem('currentStudentName');
    localStorage.removeItem('currentStudentEmail');
    checkLoginStatus();
}

// Function to render registered students for admin
async function renderRegisteredStudents() {
    const studentsList = document.getElementById('students-list');
    if (!studentsList) return;

    try {
        const response = await fetch(`${API_BASE}/students`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const students = await response.json();

        studentsList.innerHTML = '';

        if (students.length === 0) {
            studentsList.innerHTML = '<p>No students registered yet.</p>';
            return;
        }

        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student-item';
            studentDiv.innerHTML = `
                <h3>Student ID: ${student.studentId}</h3>
                <p><strong>Name:</strong> ${student.name}</p>
            `;
            studentsList.appendChild(studentDiv);
        });
    } catch (error) {
        console.error('Error rendering registered students:', error);
        studentsList.innerHTML = '<p>Error loading students.</p>';
    }
}

// Function to toggle registered students section
function toggleRegisteredStudents() {
    const aside = document.getElementById('registered-students');
    const button = document.getElementById('toggle-students');
    if (aside.style.display === 'none') {
        aside.style.display = 'block';
        button.textContent = 'Hide Registered Students';
    } else {
        aside.style.display = 'none';
        button.textContent = 'Show Registered Students';
    }
}

// Function to render all complaints for admin (including expired ones)
async function renderAdminComplaints() {
    const complaintsList = document.getElementById('all-complaints-list');
    if (!complaintsList) return;

    try {
        const response = await fetch(`${API_BASE}/complaints`);
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const complaints = await response.json();

        complaintsList.innerHTML = '';

        if (complaints.length === 0) {
            complaintsList.innerHTML = '<p>No complaints submitted yet.</p>';
            return;
        }

        complaints.forEach(complaint => {
            const isExpired = isComplaintExpired(complaint.timestamp);
            const complaintDiv = document.createElement('div');
            complaintDiv.className = 'complaint-item' + (isExpired ? ' expired' : '');
            complaintDiv.innerHTML = `
                <h3>${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)} #${complaint.id}${isExpired ? ' (Expired)' : ''}</h3>
                <p><strong>Student:</strong> ${complaint.name} (ID: ${complaint.studentId})</p>
                <p><strong>Description:</strong> ${complaint.description}</p>
                <p><strong>Status:</strong> <span class="status ${complaint.status}">${complaint.status.replace('-', ' ')}</span></p>
                <p><strong>Submitted:</strong> ${new Date(complaint.timestamp).toLocaleString()}</p>
                ${!isExpired ? `<label for="status-${complaint.id}">Update Status:</label>
                <select class="status-select" id="status-${complaint.id}" data-id="${complaint.id}">
                    <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${complaint.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="rejected" ${complaint.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                ${complaint.status === 'resolved' ? `<button class="delete-btn" data-id="${complaint.id}">Delete</button>` : ''}` : '<p><em>Expired complaints cannot be updated.</em></p>'}
            `;
            complaintsList.appendChild(complaintDiv);
        });

        // Add event listeners for status updates (only for non-expired)
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', updateComplaintStatus);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const complaintId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this resolved complaint?')) {
                    deleteComplaint(complaintId);
                }
            });
        });
    } catch (error) {
        console.error('Error rendering admin complaints:', error);
        complaintsList.innerHTML = '<p>Error loading complaints.</p>';
    }
}

// Function to send status update email
async function sendStatusUpdateEmail(complaint, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/students/${complaint.studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student');
        const student = await response.json();

        if (!student || !student.email) {
            console.error('Student email not found for status update email');
            return;
        }

        const serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
        const templateID = 'YOUR_STATUS_UPDATE_TEMPLATE_ID'; // Replace with your EmailJS template ID for status updates
        const userID = 'YOUR_USER_ID'; // Replace with your EmailJS user ID

        const templateParams = {
            to_email: student.email,
            student_name: complaint.name,
            complaint_type: complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1),
            complaint_description: complaint.description,
            complaint_id: complaint.id,
            new_status: newStatus.charAt(0).toUpperCase() + newStatus.replace('-', ' '),
            update_date: new Date().toLocaleString()
        };

        emailjs.send(serviceID, templateID, templateParams, userID)
            .then(function(response) {
                console.log('Status update email sent successfully:', response);
            }, function(error) {
                console.error('Status update email sending failed:', error);
            });
    } catch (error) {
        console.error('Error fetching student for email:', error);
    }
}

// Function to update complaint status
async function updateComplaintStatus(event) {
    const complaintId = event.target.getAttribute('data-id');
    const newStatus = event.target.value;

    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');

        renderAdminComplaints(); // Re-render to update the display
    } catch (error) {
        console.error('Error updating complaint status:', error);
        alert('Error updating complaint status. Please try again.');
    }
}

// Function to delete a complaint
async function deleteComplaint(complaintId) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete complaint');

        renderAdminComplaints(); // Re-render to update the display
    } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('Error deleting complaint. Please try again.');
    }
}

// Function to send email using EmailJS
async function sendComplaintEmail(complaint) {
    try {
        const response = await fetch(`${API_BASE}/students/${complaint.studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student');
        const student = await response.json();

        if (!student || !student.email) {
            console.error('Student email not found for complaint email');
            return;
        }

        const serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
        const templateID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
        const userID = 'YOUR_USER_ID'; // Replace with your EmailJS user ID

        const templateParams = {
            to_email: student.email,
            student_name: complaint.name,
            complaint_type: complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1),
            complaint_description: complaint.description,
            complaint_id: complaint.id,
            submission_date: new Date(complaint.timestamp).toLocaleString()
        };

        emailjs.send(serviceID, templateID, templateParams, userID)
            .then(function(response) {
                console.log('Email sent successfully:', response);
            }, function(error) {
                console.error('Email sending failed:', error);
            });
    } catch (error) {
        console.error('Error fetching student for email:', error);
    }
}

// Function to handle complaint form submission
async function handleComplaintSubmission(event) {
    event.preventDefault();

    const type = document.getElementById('complaint-category').value;
    const description = document.getElementById('complaint-description').value;

    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, description })
        });

        if (!response.ok) throw new Error('Failed to submit complaint');

        const newComplaint = await response.json();

        // Clear form
        event.target.reset();

        // Re-render complaints and update stats
        renderStudentComplaints();
        updateStudentStats();

        alert('Complaint submitted successfully!');
    } catch (error) {
        console.error('Error submitting complaint:', error);
        alert('Error submitting complaint. Please try again.');
    }
}

// Function to handle student registration on student.html
async function handleStudentRegistrationOnPortal(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const studentId = document.getElementById('reg-student-id').value.trim();

    if (!name || !email || !studentId) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/students/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, studentId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const student = await response.json();

        // Auto-login after registration
        localStorage.setItem('currentStudentId', student.studentId);
        localStorage.setItem('currentStudentName', student.name);
        localStorage.setItem('currentStudentEmail', student.email);

        event.target.reset();
        checkLoginStatus();
    } catch (error) {
        console.error('Error registering student:', error);
        alert(error.message);
    }
}

// Function to get registered students
function getRegisteredStudents() {
    const students = localStorage.getItem('registeredStudents');
    return students ? JSON.parse(students) : [];
}

// Function to save registered students
function saveRegisteredStudents(students) {
    localStorage.setItem('registeredStudents', JSON.stringify(students));
}

// Function to handle student registration
async function handleStudentRegistration(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const studentId = document.getElementById('reg-student-id').value.trim();

    if (!name || !email || !studentId) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/students/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, studentId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const student = await response.json();

        // Auto-login after registration
        localStorage.setItem('currentStudentId', student.studentId);
        localStorage.setItem('currentStudentName', student.name);
        localStorage.setItem('currentStudentEmail', student.email);

        event.target.reset();
        alert('Registration successful! Redirecting to Student Portal.');
        window.location.href = 'student.html';
    } catch (error) {
        console.error('Error registering student:', error);
        alert(error.message);
    }
}

// Function to handle student login
async function handleStudentLogin(event) {
    event.preventDefault();

    const studentId = document.getElementById('login-student-id').value.trim();

    if (!studentId) {
        alert('Please enter your Student ID.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/students/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const student = await response.json();

        localStorage.setItem('currentStudentId', student.studentId);
        localStorage.setItem('currentStudentName', student.name);
        localStorage.setItem('currentStudentEmail', student.email);
        window.location.href = 'student.html';
    } catch (error) {
        console.error('Error logging in:', error);
        alert(error.message);
    }
}

// Function to toggle between login and register sections
function toggleLoginRegister(showLogin) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const loginBtn = document.getElementById('show-login');
    const registerBtn = document.getElementById('show-register');

    if (showLogin) {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        loginBtn.classList.remove('active');
        registerBtn.classList.add('active');
    }
}

// Function to handle student login on student.html
async function handleStudentLoginOnPortal(event) {
    event.preventDefault();

    const studentId = document.getElementById('login-student-id').value.trim();

    if (!studentId) {
        alert('Please enter your Student ID.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/students/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const student = await response.json();

        localStorage.setItem('currentStudentId', student.studentId);
        localStorage.setItem('currentStudentName', student.name);
        localStorage.setItem('currentStudentEmail', student.email);

        event.target.reset();
        checkLoginStatus();
    } catch (error) {
        console.error('Error logging in:', error);
        alert(error.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check login status on student.html
    if (document.getElementById('student-login')) {
        checkLoginStatus();

        // Handle toggle buttons
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => toggleLoginRegister(true));
        }

        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => toggleLoginRegister(false));
        }

        // Handle student login form on student.html
        const studentLoginForm = document.getElementById('student-login-form');
        if (studentLoginForm) {
            studentLoginForm.addEventListener('submit', handleStudentLoginOnPortal);
        }

        // Handle student registration form on student.html
        const studentRegistrationForm = document.getElementById('student-registration-form');
        if (studentRegistrationForm) {
            studentRegistrationForm.addEventListener('submit', handleStudentRegistrationOnPortal);
        }

        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    // Handle student registration form submission
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleStudentRegistration);
    }

    // Handle student login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleStudentLogin);
    }

    // Handle complaint form submission
    const complaintForm = document.getElementById('complaint-form');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmission);
    }

    // Handle toggle for registered students on admin.html
    const toggleStudentsBtn = document.getElementById('toggle-students');
    if (toggleStudentsBtn) {
        toggleStudentsBtn.addEventListener('click', toggleRegisteredStudents);
    }

    // Render complaints and students on page load
    renderStudentComplaints();
    renderAdminComplaints();
    renderRegisteredStudents();
});
