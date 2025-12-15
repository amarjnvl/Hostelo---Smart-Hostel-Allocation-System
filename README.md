# Hostelo - Smart Hostel Allocation System

Hostelo is a comprehensive web application designed to streamline the hostel allocation process for universities. It simplifies room selection, group formation, and administrative management with a modern, user-centric interface.

## 🚀 Features

### 🎓 Student Portal
- **Smart Dashboard**: Real-time view of allocation status, group details, and hostel eligibility.
- **Hostel Selection**: Browse available hostels filtered by academic year and gender.
- **Group Formation**: 
  - Create groups for 2-sharing rooms.
  - **Leader-Member Model**: Only group leaders can add members, ensuring organized group management.
  - **Secure Invites**: Add roommates via Roll Number with OTP verification for security.
- **Roommate Requests**: Manage incoming requests and view group status.
- **Profile Management**: View student details and eligibility.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, translucent UI components with blur effects.
- **Semantic Dark/Light Mode**: 
  - **Dark Mode**: Deep "Academic Navy" theme with glowing accents.
  - **Light Mode**: High-contrast "Academic Slate" theme with "milky white" glass cards for perfect readability.
  - **Smooth Transitions**: animated toggle with spring physics.
- **Responsive**: Fully optimized for mobile and desktop views.

### 🛡️ Security & Logic
- **Year-Based Constraints**: Strict validation ensures only students of the same year can group together.
- **One-Time Registration**: Prevents students from registering for multiple hostels.
- **OTP Authentication**: Secure login and roommate addition flow using email OTPs.
- **JWT Authorization**: Protected routes and persistent sessions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT & OTP-based 

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hostelo.git
   cd hostelo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_secret
   # EMAIL_USER=your_email
   # EMAIL_PASS=your_app_password
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the App**
   Open `http://localhost:5173` in your browser.

## 🤝 Contribution
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
&copy; 2025 Hostelo Inc. | Built with ❤️ for NIT Trichy
