# REVERSIDE Time Tracker - Quick Start Guide

Get up and running with the REVERSIDE Time Tracker in just a few minutes!

## Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd reverside-time-tracker
npm run setup
```

### 2. Configure Database
```bash
# Create PostgreSQL database
createdb reverside_time_tracker

# Copy environment file
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reverside_time_tracker
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
SESSION_SECRET=your_random_secret_key_here
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Access the Application
Open your browser to: **http://localhost:3000**

**Default Admin Login:**
- Email: `admin@reverside.com`
- Password: `admin123`

## What You Get

### 🏢 **Employee Portal**
- **Dashboard**: Overview of timesheets and statistics
- **Time Entry**: Log daily work hours with project details
- **Timesheet Management**: Create, edit, and submit weekly timesheets
- **Reports**: View project and time-based analytics

### 👨‍💼 **Admin Portal**
- **Timesheet Review**: Approve or reject employee submissions
- **Employee Management**: View and manage user accounts
- **Reporting**: Generate comprehensive time tracking reports
- **User Registration**: Create new employee accounts

### 🔧 **Technical Features**
- **Modular Architecture**: Easy database swapping (PostgreSQL → SQLite/MySQL)
- **RESTful API**: Complete API for integrations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Secure Authentication**: Session-based with bcrypt encryption

## First Steps

1. **Login as Admin** using the default credentials above
2. **Create Employee Accounts** via the "Add Employee" button
3. **Switch to Employee View** by logging in as an employee
4. **Create Your First Timesheet** for the current week
5. **Submit Timesheet** and switch back to admin to approve it

## Key Features to Try

### For Employees:
- ✅ Create a new timesheet for this week
- ✅ Add multiple time entries with different projects
- ✅ Submit timesheet for approval
- ✅ View your timesheet history and statistics

### For Admins:
- ✅ Review pending timesheets
- ✅ Approve or reject timesheets with comments
- ✅ View employee management dashboard
- ✅ Generate time tracking reports

## API Usage

The application includes a complete REST API:

```bash
# Get user info
curl -X GET http://localhost:3000/api/user

# Create timesheet
curl -X POST http://localhost:3000/api/timesheets \
  -H "Content-Type: application/json" \
  -d '{"week_ending":"2024-01-07","time_entries":[{"project":"Test","date":"2024-01-01","hours":8}]}'

# Get statistics
curl -X GET http://localhost:3000/api/stats
```

## Database Flexibility

The modular design allows easy database switching:

### Switch to SQLite (for development):
1. Update `config/database.js` to use SQLite
2. Modify migration scripts for SQLite syntax
3. No other changes needed!

### Switch to MySQL:
1. Update connection config
2. Adjust migration scripts
3. Update package.json dependencies

## Troubleshooting

### Common Issues:

**Database Connection Error:**
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists

**Port Already in Use:**
- Change `PORT=3001` in `.env` file
- Or kill process using port 3000

**Migration Errors:**
- Ensure database user has CREATE privileges
- Check PostgreSQL version compatibility

### Getting Help:

1. **Check Logs**: Look at console output for error details
2. **Database Status**: Verify PostgreSQL is running
3. **Environment**: Ensure `.env` file is properly configured
4. **Dependencies**: Run `npm install` to ensure all packages are installed

## Next Steps

- **Customize Branding**: Update colors and logo in `public/css/style.css`
- **Add Features**: Extend the modular architecture
- **Deploy**: Follow production deployment guide in README.md
- **Integrate**: Use the REST API for external integrations

## Support

- 📧 Email: support@reverside.com
- 📖 Documentation: See README.md for detailed information
- 🐛 Issues: Report bugs via GitHub Issues

---

**Welcome to REVERSIDE Time Tracker!** 🚀

*You are with good company* - Start tracking time efficiently and professionally.
