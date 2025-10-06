# REVERSIDE Time Tracker

A comprehensive, modular web application for IT consultants to log their weekly work hours with advanced time tracking capabilities.

## 🚀 Features

### **User Management**
- **Secure Authentication**: Role-based login system (Admin/Employee)
- **User Registration**: Easy employee onboarding
- **Session Management**: Persistent login sessions

### **Employee Portal**
- **Time Entry Capture**: Log daily work hours with project details
- **Timesheet Management**: Create, edit, and submit weekly timesheets
- **Project Tracking**: Track time across multiple projects
- **Dashboard**: Overview of timesheet status and statistics

### **Admin Portal**
- **Timesheet Approval**: Review, approve, or reject employee timesheets
- **Employee Management**: Manage employee accounts and status
- **Reporting**: Generate comprehensive reports and analytics
- **Dashboard**: System overview and pending timesheets

### **Technical Features**
- **Modular Database**: SQLite with easy migration to PostgreSQL/MySQL
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Dynamic form handling and validation
- **Data Validation**: Comprehensive input validation and error handling
- **Sticky Footer**: Professional layout with footer always at bottom

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript (EJS templating)
- **Database**: SQLite (easily swappable with PostgreSQL/MySQL)
- **Authentication**: bcrypt + express-session
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6.0

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kchetty100/Time-capture-system.git
   cd Time-capture-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   SESSION_SECRET=your-secret-key
   DB_PATH=./data/reverside_time_tracker.db
   ```

4. **Database Setup**
   ```bash
   npm run migrate
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Default admin credentials: `admin@reverside.com` / `admin123`
   - Create employee accounts through the admin portal

## 🏗️ Architecture

### **Modular Design**
- **Repository Pattern**: Database abstraction layer
- **Service Layer**: Business logic separation
- **Middleware**: Authentication and validation
- **MVC Pattern**: Clear separation of concerns

### **Database Schema**
- **Users**: Authentication and user management
- **Timesheets**: Weekly time tracking records
- **Time Entries**: Individual time log entries
- **Indexes**: Optimized query performance

### **File Structure**
```
├── config/           # Database configuration
├── middleware/       # Authentication middleware
├── repositories/     # Data access layer
├── routes/          # API and page routes
├── services/        # Business logic
├── views/           # EJS templates
├── public/          # Static assets
├── scripts/         # Database migrations
└── tests/           # Test files
```

## 🎯 Usage

### **For Employees**
1. Login with your credentials
2. Navigate to "New Timesheet" to create weekly timesheets
3. Add time entries with project, date, hours, and description
4. Save as draft or submit for approval
5. View your timesheet history and status

### **For Admins**
1. Login with admin credentials
2. Review pending timesheets in the dashboard
3. Approve or reject timesheets with comments
4. Manage employee accounts
5. Generate reports and analytics

## 🔧 Configuration

### **Database Migration**
The application supports easy database switching:

```bash
# SQLite (default)
npm run migrate

# PostgreSQL (if configured)
npm run migrate:pg
```

### **Environment Variables**
- `NODE_ENV`: Application environment
- `PORT`: Server port (default: 3000)
- `SESSION_SECRET`: Session encryption key
- `DB_PATH`: SQLite database path
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL config

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly design

## 🔒 Security Features

- **Password Hashing**: bcrypt encryption
- **Session Management**: Secure session handling
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Output encoding

## 🚀 Deployment

### **Production Setup**
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure session secret
4. Use process manager (PM2 recommended)

### **Docker Support**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Recent Improvements

### **UI/UX Enhancements**
- ✅ **Reduced White Space**: Compact, professional layout
- ✅ **Sticky Footer**: Footer always positioned at bottom
- ✅ **Responsive Design**: Optimized for all screen sizes
- ✅ **Improved Spacing**: Better visual hierarchy

### **Technical Improvements**
- ✅ **SQLite Integration**: Easy setup without PostgreSQL
- ✅ **Database Abstraction**: Modular repository pattern
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Code Organization**: Clean, maintainable structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: [Your Contact Information]

## 🎉 Acknowledgments

- Built with ❤️ for REVERSIDE CONSULTING
- Inspired by modern time tracking needs
- Designed for scalability and maintainability

---

**REVERSIDE CONSULTING** - *You are with good company* ⭐