# TimeClock

A comprehensive employee time management system built with Next.js 14 and TypeScript. Manage timesheets, schedules, departments, and leave requests with real-time updates.

![Landing Hero](./public/snapshots/landing-hero.png)

### Demo website
Webiste: [tahirtimeclock.netlify.app](https://tahirtimeclock.netlify.app/)

### Demo Credentials

```typescript
// Test accounts
Admin:     admin@timeclock.com / admin123
Employee:  john@timeclock.com / employee123  
Manager:   manager@timeclock.com / manager123
```


## Roles

### Super Admin
- Access to all departments and system settings
- Manage all users, departments, and configurations
- View system-wide analytics and reports

### Department Admin
- Manage specific department(s)
- Add/remove department employees
- Configure department settings
- View department reports

### Department Manager
- Oversee daily operations
- Approve timesheets and leave requests
- View department schedules
- Manage employee assignments

## Core Features

### 🔐 Authentication & Authorization
- Email/password with 2FA support
- Social login integration (Google OAuth)
- Role-based access control
- Session management
- Password reset functionality

### ⏰ Time Management
- Advanced clock in/out system
- Break management
- Overtime tracking
- Location verification
- Real-time status updates
- Multi-department time off requests

### 👥 Department Management
- Department creation and configuration
- Employee assignment and roles
- Budget tracking and analytics
- Resource allocation
- Performance monitoring

### 👤 Employee Management
- Comprehensive profile management
- Rate and position settings
- Department transfers
- Attendance tracking
- Performance metrics

### 📅 Scheduling
- Dynamic shift creation
- Weekly schedule management
- Conflict detection
- Time off integration
- Calendar view with real-time updates

### 📊 Reports & Analytics
- Department cost analysis
- Hours and attendance tracking
- Employee statistics
- Time off patterns
- Performance reporting

## Tech Stack

### Frontend
- Next.js 14 App Router
- React Server Components
- TypeScript
- TailwindCSS
- shadcn/ui components
- Framer Motion animations

### Backend
- Next.js API Routes
- Server Actions
- Prisma ORM
- PostgreSQL
- Auth.js v5
- Google SMTP or Resend for emails

### Infrastructure
- Vercel deployment
- PostgreSQL database
- Real-time updates
- PWA support
- Mobile responsive design

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/tahirabbas11/TimeClock.git
   cd TimeClock
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Copy example env file
   cp .env.example .env
   ```

   Configure the following in `.env`:
   ```bash
    # Database configuration
    DATABASE_URL="mysql://username:password@localhost:3306/timeclock"

    # Authentication
    AUTH_SECRET="your_auth_secret"
    AUTH_TRUST_HOST=true

    # Application URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

    # Google OAuth credentials
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"

    # Google SMTP credentials
    GOOGLE_SMTP_USER="your_email@gmail.com"
    GOOGLE_SMTP_PASS="your_google_app_password"

    # Resend API key
    RESEND_API_KEY="your_resend_api_key"

    # Email service (google or resend)
    EMAIL_SERVICE="google"
   ```

4. Run Prisma migration:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
Visit [http://localhost:3000](http://localhost:3000) to view the application in development mode.


## Development

## Deployment
### Vercel Deploy
1. Set all required environment variables in Vercel dashboard
2. Configure authentication providers
3. Set up database connection

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License
MIT License - see LICENSE file

## Author
Tahir Abbas

Website: [thetahirabbas.netlify.app](https://thetahirabbas.netlify.app/)  
GitHub: [@tahirabbas11](https://github.com/tahirabbas11)# TimeClock
