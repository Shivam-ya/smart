# Smart Attendance System (AttendIQ)

A full-stack Next.js web application for advanced smart attendance tracking using QR scanning, Geofencing, and Face Recognition (Simulated) with MongoDB as the database, beautifully designed with modern UI standards.

## Features Included

- **Role-based Authentication**: JWT-secured login for Admin (Teachers) & Students.
- **Smart Attendance**: Dynamic auto-refreshing QR Code scanning. Check presence using device Geofencing logic plus a Simulated Face Recognition capture step.
- **Modern UI**: Dark/Light mode, ShadCN aesthetic utility variants, and Glassmorphism design elements using TailwindCSS.
- **Real-time Analytics**: Built with Recharts for visual feedback. SWR/Polling handles real-time live attendance counts.
- **Reports Export**: Generates attendance CSV using PapaParse.
- **Leave Management**: Students can apply; Admins can approve/reject.

## Technology Stack

- **Framework**: Next.js 15+ (App Router, Serverless API functions)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jose), bcryptjs
- **Styling**: Tailwind CSS
- **Additional Tools**: Lucide-react (icons), Recharts, PapaParse, React-Webcam, qrcode.react

## Running the Application Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # .env.local
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/attendance?retryWrites=true&w=majority
   JWT_SECRET=my_super_secret_jwt_signature_key
   
   # Optional: For Nodemailer SMTP settings (defaults to ethereal mock if missing)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Demo Instructions

1. **Register as a Teacher**:
   - Go to `http://localhost:3000/signup`.
   - Select "Role: Teacher (Admin)".
   - Enter your name, email, and password.

2. **Setup a Class**:
   - In the Admin Dashboard (`/dashboard/admin`), navigate to the "Classes" tab.
   - Click "Add Class" and input some coordinates. E.g., `Lat: 34.0522, Lng: -118.2437` (Los Angeles) or your current real coordinates for testing the Geofence.

3. **Register as a Student**:
   - Open an incognito window or log out.
   - Sign up with "Role: Student" and provide a "Roll Number".

4. **Mark Attendance**:
   - Admin side: Click "Show QR" on the class to reveal the auto-refreshing QR.
   - Student side: Go to "Mark Attendance". Enter the `Class ID` (you can find it in the admin's database or Network tab). Since the camera will pop up, grant webcam access and ensure location is active to simulate the full pipeline!

## Deploying to Vercel

This repository is optimized for Vercel deployment:
- Just import the repository and ensure you add the Environment Variabes (`MONGODB_URI`, `JWT_SECRET`) in the Vercel project settings.
- Standard framework preset "Next.js" will naturally pick up all defaults and build without errors.
