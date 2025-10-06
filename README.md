# REVERSIDE Time Tracker

A modular web application for IT consultants to log their weekly work hours, built with Node.js, Express, and PostgreSQL.

## Features

### Employee Portal
- **Time Entry**: Log daily work hours with project details and descriptions
- **Timesheet Management**: Create, edit, and submit weekly timesheets
- **Dashboard**: View statistics and recent timesheet activity
- **Reports**: Generate project and time-based reports

### Admin Portal
- **Timesheet Approval**: Review, approve, or reject employee timesheets
- **Employee Management**: View and manage employee accounts
- **Reporting**: Generate comprehensive time tracking reports
- **User Registration**: Create new employee and admin accounts

### Technical Features
- **Modular Architecture**: Repository pattern for easy database swapping
- **Secure Authentication**: Session-based authentication with bcrypt
- **Responsive Design**: Mobile-friendly interface with REVERSIDE branding
- **RESTful API**: Complete API for frontend and external integrations
- **Database Flexibility**: PostgreSQL with easy migration to SQLite/MySQL

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML, CSS, JavaScript (EJS templating)
- **Database**: PostgreSQL (modular design)
- **Authentication**: Express-session + bcryptjs
- **Styling**: Custom CSS with CSS variables

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reverside-time-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=reverside_time_tracker
   DB_USER=your_username
   DB_PASSWORD=your_password
   SESSION_SECRET=your_session_secret_here
   PORT=3000
   NODE_ENV=development
   ADMIN_EMAIL=admin@reverside.com
   ADMIN_PASSWORD=admin123
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb reverside_time_tracker
   
   # Run migrations
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Login with default admin credentials:
     - Email: `admin@reverside.com`
     - Password: `admin123`

## Database Schema

The application uses a modular database design with the following tables:

- **users**: Employee and admin accounts
- **timesheets**: Weekly timesheet submissions
- **time_entries**: Individual time entries within timesheets

### Key Features of Database Design:
- **Modular Repository Pattern**: Easy to swap databases
- **Automatic Triggers**: Update timesheet totals when entries change
- **Proper Indexing**: Optimized for common queries
- **Data Integrity**: Foreign key constraints and validation

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/register` - Register new user (admin only)

### Employee API
- `GET /api/timesheets` - Get user's timesheets
- `POST /api/timesheets` - Create new timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `POST /api/timesheets/:id/submit` - Submit timesheet

### Admin API
- `GET /api/employees` - Get all employees
- `POST /api/timesheets/:id/approve` - Approve timesheet
- `POST /api/timesheets/:id/reject` - Reject timesheet
- `POST /api/employees/:id/toggle-status` - Toggle employee status

### Reports API
- `GET /api/stats` - Get timesheet statistics
- `GET /api/stats/weekly` - Get weekly statistics
- `GET /api/stats/projects` - Get project statistics

## Project Structure

```
reverside-time-tracker/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── repositories/
│   ├── base-repository.js   # Base repository class
│   ├── user-repository.js   # User data access
│   ├── timesheet-repository.js
│   └── time-entry-repository.js
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── employee.js          # Employee portal routes
│   ├── admin.js             # Admin portal routes
│   └── api.js               # API routes
├── services/
│   └── timesheet-service.js # Business logic
├── scripts/
│   ├── migrate.js           # Migration runner
│   └── migrations/          # Database migrations
├── views/
│   ├── layout.ejs           # Main layout template
│   ├── auth/                # Authentication views
│   ├── employee/            # Employee portal views
│   └── admin/               # Admin portal views
├── public/
│   ├── css/style.css        # Main stylesheet
│   └── js/app.js            # Client-side JavaScript
├── server.js                # Main application file
├── package.json
└── README.md
```

## Modular Database Design

The application is designed with database flexibility in mind:

### Repository Pattern
- **BaseRepository**: Common CRUD operations
- **Specialized Repositories**: Domain-specific data access
- **Service Layer**: Business logic separation

### Database Abstraction
- **Database Config**: Centralized connection management
- **Query Builder**: Consistent query interface
- **Migration System**: Version-controlled schema changes

### Easy Database Swapping
To switch from PostgreSQL to another database:

1. Update `config/database.js` with new connection logic
2. Modify migration scripts for new database syntax
3. Update repository queries if needed (minimal changes)

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restarts on file changes.

### Database Migrations
```bash
# Run all migrations
npm run migrate

# Create new migration
# Add new SQL file to scripts/migrations/
```

### Testing
```bash
npm test
```

## Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `SESSION_SECRET`
   - Configure production database

2. **Database**
   - Run migrations on production database
   - Set up proper database user permissions

3. **Security**
   - Use HTTPS in production
   - Set secure session cookies
   - Implement proper CORS policies

4. **Process Management**
   - Use PM2 or similar process manager
   - Set up proper logging
   - Configure monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Email: support@reverside.com
- Documentation: [Link to documentation]
- Issues: [GitHub Issues]

---

**REVERSIDE CONSULTING** - You are with good company
