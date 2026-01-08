# ClimateHub Development Environment Setup

This document provides instructions for setting up the ClimateHub development environment using the automated setup script.

## Overview

The setup script automates the following tasks:
- Checks Node.js version compatibility
- Validates and manages required environment variables
- Installs dependencies for both backend and frontend
- Checks and resolves port conflicts (5000 for backend, 5173 for frontend)
- Handles database setup (imports schema from db_schema.sql if needed)
- Builds the frontend (if needed)
- Starts development servers

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- PostgreSQL database server
- Git (for cloning the repository)

## Setup Script Usage

### 1. Make the script executable (if not already done):

```bash
chmod +x setup-dev-environment.sh
```

### 2. Run the setup script:

```bash
./setup-dev-environment.sh
```

This will perform all setup steps except starting the development servers.

### 3. To run the development servers after setup:

```bash
npm run dev
```

Or start the servers directly with the script:

```bash
./setup-dev-environment.sh start
```

## Environment Variables

The script will create a `.env` template file if one doesn't exist. Update the values according to your local environment:

```bash
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=climate_platform
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Secret (at least 32 random characters)
JWT_SECRET=your_super_secret_jwt_key_here_must_be_at_least_32_characters_long

# News API Key (optional but recommended for news functionality)
NEWS_API_KEY=your_news_api_key_here

# Port Configuration (optional, defaults to 5000 for backend)
PORT=5000
```

## Script Features

### Port Management
- Automatically checks if ports 5000 (backend), 5173 (frontend), and 3000 (fallback) are available
- Attempts to free occupied ports by killing the processes using them
- Provides warnings if ports cannot be freed

### Dependency Installation
- Installs root dependencies (backend)
- Installs client dependencies (frontend)
- Works with both npm and yarn lock files

### Environment Validation
- Checks for required environment variables: `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`
- Validates recommended variables: `NEWS_API_KEY`, `PORT`
- Validates JWT_SECRET length for security (should be at least 32 characters)
- Ensures DB_PORT and PORT are numeric
- Provides summary of environment configuration

### Database Setup
- Detects SQL schema file (db_schema.sql) and imports it to PostgreSQL database
- Creates database if it doesn't exist
- Provides guidance for manual database setup if needed

### Cross-Platform Compatibility
- Works on Linux, Mac, and Windows (with Git Bash)
- Detects the operating system and adjusts commands accordingly
- Handles different process management commands per platform

## Troubleshooting

### Common Issues and Solutions

#### 1. Node.js Version Error
**Problem**: "Node.js version X.X.X is too old. Please upgrade to Node.js 16 or higher."

**Solution**: Upgrade Node.js to version 16 or higher using:
- [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm)
- Official [Node.js installer](https://nodejs.org/)

#### 2. Missing Dependencies
**Problem**: Failed to install dependencies due to network issues.

**Solution**: 
- Check internet connection
- Clear npm cache: `npm cache clean --force`
- Retry the setup script

#### 3. Port Conflict Errors
**Problem**: Cannot free port even after script attempts to kill processes.

**Solution**:
- Manually check what's using the port:
  - Linux/macOS: `lsof -i :5000` or `lsof -i :5173`
  - Windows: `netstat -ano | findstr :5000` or `netstat -ano | findstr :5173`
- Manually kill the processes using the port
- Retry the setup script

#### 4. Database Connection Issues
**Problem**: Application fails to connect to the database.

**Solution**:
- Verify PostgreSQL server is running
- Check database credentials in `.env` file
- Ensure database exists (the script will create it if it doesn't exist)
- Import the schema from `db_schema.sql` manually if needed

### Manual Steps (if script fails)

If the script fails at any point, you can perform the setup manually:

1. **Install dependencies**:
   ```bash
   npm install                    # Backend dependencies
   cd client && npm install     # Frontend dependencies
   ```

2. **Set up environment variables**:
   ```bash
   # Create .env file with appropriate values
   # See "Environment Variables" section above
   ```

3. **Import database schema**:
   ```bash
   # Connect to PostgreSQL and import schema
   psql -d climate_platform -U postgres -f db_schema.sql
   ```

4. **Start development servers**:
   ```bash
   npm run dev                  # Concurrently starts both servers
   ```

## Development Workflow

After successful setup:

1. **Start development servers**:
   ```bash
   npm run dev
   ```
   or
   ```bash
   ./setup-dev-environment.sh start
   ```

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

3. **Stop development servers**: Press `Ctrl+C` in the terminal

## Additional Notes

- The script is designed to work on Linux, macOS, and Windows (with Git Bash or WSL)
- Environment variables are validated but not exposed in console output
- The script handles both initial setup and ongoing development workflows
- For production deployments, additional configuration may be required
- The script includes colored output for better readability and progress tracking

## Support

If you encounter issues not covered in this document:

1. Review the error messages from the script
2. Check that all prerequisites are met
3. Verify your environment variables are correctly set
4. Consult the project documentation
5. Contact the development team if issues persist