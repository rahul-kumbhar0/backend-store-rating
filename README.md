```markdown
# Store Rating System - Backend

## Project Overview
This is the backend API for the Store Rating System, a full-stack web application that enables users to rate stores (1-5 stars) with role-based access control. The system supports three user roles: System Administrator, Normal User, and Store Owner. It handles user authentication, store management, rating submissions, and provides dashboards with analytics.

Built with Node.js and PostgreSQL, the API ensures secure, scalable, and maintainable operations for a multi-tenant rating platform.

## Technologies Used
- **Runtime**: Node.js (v22.16.0)
- **Framework**: Express.js (v4.18.2)
- **Database**: PostgreSQL with Sequelize ORM (v6.32.1)
- **Authentication**: JSON Web Tokens (JWT) (v9.0.2)
- **Security**: Bcryptjs for password hashing (v2.4.3), Helmet for security headers (v7.0.0)
- **Validation**: Joi for input validation (v17.9.2)
- **Utilities**: CORS (v2.8.5), Morgan for logging (v1.10.0), Dotenv for environment variables (v16.3.1)

## Features Implemented

### System Administrator Functionalities
- **User Management**: Add new users (normal users, admins, store owners) with details: Name, Email, Password, Address, Role.
- **Store Management**: Add new stores with Name, Email, Address.
- **Dashboard Analytics**:
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
- **Listings with Filters**:
  - View and filter stores by Name, Email, Address, Rating
  - View and filter users by Name, Email, Address, Role
- **User Details**: View comprehensive user profiles, including store owner average ratings.
- **Sorting**: All tables support ascending/descending sorting on key fields (Name, Email, etc.).

### Normal User Functionalities
- **Authentication**: Sign up and log in with secure password requirements.
- **Profile Management**: Update password after login.
- **Store Interaction**:
  - View list of all registered stores
  - Search stores by Name and Address
  - Display store details: Name, Address, Overall Rating, User's Submitted Rating
- **Rating System**:
  - Submit ratings (1-5) for stores
  - Modify existing ratings
  - Prevent duplicate ratings per user per store

### Store Owner Functionalities
- **Authentication**: Log in and update password.
- **Dashboard**:
  - View list of users who rated their store
  - Display average rating for their store

### Form Validations
- **Name**: 20-60 characters (required for users and stores)
- **Email**: Standard email format validation (required)
- **Password**: 8-16 characters, must include at least one uppercase letter and one special character
- **Address**: Maximum 400 characters (required for users and stores)
- **Ratings**: Integer between 1 and 5 (required)

### Additional Features
- **Role-Based Access Control**: Middleware ensures endpoints are protected based on user roles (protect, admin, storeOwner).
- **Error Handling**: Comprehensive error responses with specific HTTP status codes.
- **Security Best Practices**: Password hashing, JWT expiration, input sanitization, CORS configuration.
- **Database Design**: Normalized schema with proper relationships (Users, Stores, Ratings) and constraints.

## Installation and Setup

### Prerequisites
- Node.js (v22 or higher)
- PostgreSQL database (hosted on Render or local)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rahul-kumbhar0/backend-store-rating.git
   cd backend-store-rating
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a [.env](cci:7://file:///c:/Users/91950/OneDrive/Desktop/Store%20Rating%20Sysytem/backend/.env:0:0-0:0) file in the root directory:
   ```env
   # Database Configuration (PostgreSQL on Render)
   DB_HOST=<your-render-postgres-host>
   DB_PORT=5432
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   DB_NAME=<your-db-name>
   DB_SSL=true

   # JWT Configuration
   JWT_SECRET=<your-secure-secret-key>
   JWT_EXPIRE=7d

   # CORS (Frontend URL)
   CORS_ORIGIN=https://store-rating-app-pied.vercel.app

   # Environment
   NODE_ENV=production
   ```

4. **Run Locally** (For Development)
   ```bash
   npm run dev  # Starts with nodemon
   ```

5. **Run in Production**
   ```bash
   npm start  # Starts the server
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)
- **POST /register**: Register a new user (Public)
  - Body: `{ name, email, password, address, role? }`
- **POST /login**: Authenticate user (Public)
  - Body: `{ email, password }`
- **POST /logout**: Logout user (Private)

### Admin Routes (`/api/admin`) - Requires Admin Role
- **GET /dashboard**: Get dashboard stats (users, stores, ratings)
- **POST /stores**: Create a new store
  - Body: `{ name, email, address }`
- **GET /stores**: List stores with optional filters (name, address)
- **GET /users**: List users with optional filters (name, email, address, role)
- **GET /users/:id**: Get detailed user info (including store owner rating if applicable)

### User Routes (`/api/user`) - Requires Authentication
- **GET /stores**: List stores with ratings and search (name, address)
- **POST /ratings**: Submit a rating for a store
  - Body: `{ rating, storeId }`
- **PUT /ratings/:id**: Update an existing rating
  - Body: `{ rating }`
- **PUT /change-password**: Update user password
  - Body: `{ currentPassword, newPassword }`

### Store Owner Routes (`/api/store-owner`) - Requires Store Owner Role
- **GET /dashboard**: Get store owner dashboard (ratings, average)
- **GET /ratings**: List users who rated their store

## Database Schema

### Tables
- **Users**:
  - id (INTEGER, PK, AI)
  - name (STRING, 20-60 chars)
  - email (STRING, unique)
  - password (STRING, hashed)
  - address (STRING, max 400 chars)
  - role (ENUM: SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER)
  - createdAt, updatedAt (TIMESTAMPS)

- **Stores**:
  - id (INTEGER, PK, AI)
  - name (STRING, 20-60 chars)
  - email (STRING, unique)
  - address (TEXT, max 400 chars)
  - ownerId (INTEGER, FK to Users.id, nullable)
  - createdAt, updatedAt (TIMESTAMPS)

- **Ratings**:
  - id (INTEGER, PK, AI)
  - userId (INTEGER, FK to Users.id)
  - storeId (INTEGER, FK to Stores.id)
  - rating (INTEGER, 1-5)
  - createdAt, updatedAt (TIMESTAMPS)
  - Unique constraint on (userId, storeId)

### Relationships
- User hasMany Ratings (as rater)
- Store hasMany Ratings (as target)
- User hasOne Store (as owner, optional)
- Store belongsTo User (as owner)

## Deployment
- **Platform**: Render (https://render.com)
- **Live URL**: https://backend-stores-2dbn.onrender.com
- **Database**: Render PostgreSQL (free tier)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Configured in Render dashboard (DB_* and others)

## Challenges Overcome
1. **Database Migration**: Switched from MySQL to PostgreSQL for easier deployment on Render; updated Sequelize models and references.
2. **Foreign Key Constraints**: Fixed case sensitivity issues in model associations (e.g., 'Users' vs 'users').
3. **Authentication and Authorization**: Implemented JWT-based auth with role checks; ensured secure token handling.
4. **Validation Errors**: Resolved password hashing conflicts by removing redundant model validations and relying on Joi middleware.
5. **CORS Configuration**: Set up multi-origin CORS for production (Vercel frontend).
6. **Deployment Issues**: Debugged ETIMEDOUT and module errors; ensured proper env vars and entry points.

## Testing
1. **Manual Testing**:
   - Use Postman or curl for API testing.
   - Example: `curl -X POST https://backend-stores-2dbn.onrender.com/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"Test123!","address":"Test Address"}'`

2. **Automated Testing**:
   - Run `npm test` (Jest setup available but not fully implemented in this version).

3. **Integration Testing**:
   - Test full flows: Register → Login → Submit Rating → View Dashboard.

## Best Practices Followed
- **Security**: Hashed passwords, JWT expiration, input validation, CORS restrictions.
- **Error Handling**: Consistent error responses with meaningful messages.
- **Code Organization**: Separated concerns (controllers, middleware, models, routes).
- **Database Design**: Normalized schema, proper indexes, constraints.
- **Scalability**: Stateless API, efficient queries, environment-based config.

## Contributing
- Fork the repo, create a feature branch, submit a PR.
- Follow ESLint rules (if added).
- Update this README for new features.

## License
ISC (as per package.json)

## Contact
- Developer: Rahul Kumbhar
- GitHub: https://github.com/rahul-kumbhar0/backend-store-rating
```
