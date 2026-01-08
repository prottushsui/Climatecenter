#!/bin/bash

# ClimateHub Development Environment Setup Script
# This script installs dependencies, validates environment variables,
# checks for port conflicts, and starts both frontend and backend servers.

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}==============================================${NC}"
    echo -e "${PURPLE}  ClimateHub Development Environment Setup${NC}"
    echo -e "${PURPLE}==============================================${NC}"
}

# Check if running on Windows (Git Bash) or Unix-like system
check_os() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        print_warning "Running on Windows (Git Bash). Some features may behave differently."
        IS_WINDOWS=true
    else
        IS_WINDOWS=false
    fi
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (version 16 or higher) and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$NODE_MAJOR" -lt 16 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16 or higher."
        exit 1
    fi
    
    print_success "Node.js version $NODE_VERSION detected."
}

# Check if a port is in use and kill the process if needed
check_and_free_port() {
    local port=$1
    local port_name=$2
    
    print_status "Checking if $port_name port ($port) is available..."
    
    if command -v lsof &> /dev/null; then
        # Unix-like systems
        PID=$(lsof -t -i:$port)
    elif command -v netstat &> /dev/null; then
        # Alternative for systems without lsof
        PID=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
    else
        # Windows or systems without lsof/netstat
        if [ "$IS_WINDOWS" = true ]; then
            PID=$(netstat -ano | grep LISTENING | grep ":$port " | awk '{print $5}')
        else
            print_warning "Could not check port $port. lsof and netstat not available."
            return 0
        fi
    fi
    
    if [ ! -z "$PID" ] && [ "$PID" != "" ]; then
        print_warning "Port $port is in use by process ID $PID. Attempting to free the port..."
        
        if [ "$IS_WINDOWS" = true ]; then
            # Windows: kill the process
            taskkill /F /PID $PID > /dev/null 2>&1
        else
            # Unix-like: kill the process
            kill -9 $PID > /dev/null 2>&1
        fi
        
        # Wait a moment for the port to be released
        sleep 2
        
        # Double-check if the port is now free
        if command -v lsof &> /dev/null; then
            NEW_PID=$(lsof -t -i:$port)
        elif [ "$IS_WINDOWS" = true ]; then
            NEW_PID=$(netstat -ano | grep LISTENING | grep ":$port " | awk '{print $5}')
        else
            NEW_PID=""
        fi
        
        if [ ! -z "$NEW_PID" ] && [ "$NEW_PID" != "" ]; then
            print_error "Failed to free port $port. Process ID $NEW_PID is still using it."
            print_error "Please manually stop the process using port $port and try again."
            exit 1
        else
            print_success "Successfully freed port $port."
        fi
    else
        print_success "Port $port is available."
    fi
}

# Validate required environment variables
validate_environment_variables() {
    print_status "Validating environment variables..."
    
    # Check if .env file exists, if not create a template
    if [ ! -f "./.env" ]; then
        print_warning ".env file not found. Creating a template..."
        create_env_template
    fi
    
    # Load environment variables
    export $(grep -v '^#' .env | xargs)
    
    # Required environment variables
    REQUIRED_VARS=(
        "DB_USER"
        "DB_HOST" 
        "DB_NAME"
        "DB_PASSWORD"
        "DB_PORT"
        "JWT_SECRET"
    )
    
    # Optional but recommended variables
    RECOMMENDED_VARS=(
        "NEWS_API_KEY"
        "PORT"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${MISSING_VARS[*]}"
        print_error "Please update your .env file with the missing values."
        print_error "Refer to .env.example for the expected format."
        exit 1
    fi
    
    # Check recommended variables
    MISSING_RECOMMENDED=()
    for var in "${RECOMMENDED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_RECOMMENDED+=("$var")
        fi
    done
    
    if [ ${#MISSING_RECOMMENDED[@]} -gt 0 ]; then
        print_warning "Missing recommended environment variables: ${MISSING_RECOMMENDED[*]}"
        if [[ " ${MISSING_RECOMMENDED[@]} " =~ " NEWS_API_KEY " ]]; then
            print_warning "News API functionality may be limited without NEWS_API_KEY"
        fi
    fi
    
    # Validate JWT_SECRET length
    if [ ${#JWT_SECRET} -lt 32 ]; then
        print_warning "JWT_SECRET should be at least 32 characters for security."
        print_warning "Current length: ${#JWT_SECRET}"
    fi
    
    # Validate DB_PORT is numeric
    if ! [[ "$DB_PORT" =~ ^[0-9]+$ ]]; then
        print_error "DB_PORT must be a number. Current value: $DB_PORT"
        exit 1
    fi
    
    # Validate PORT if set
    if [ ! -z "$PORT" ] && ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
        print_error "PORT must be a number. Current value: $PORT"
        exit 1
    fi
    
    print_success "Environment variables validated successfully."
    
    # Print summary of key variables (without showing sensitive values)
    print_status "Environment summary:"
    print_status "  Database: $DB_HOST:$DB_PORT/$DB_NAME"
    print_status "  Port: ${PORT:-5000}"
    print_status "  JWT Secret: $(if [ ${#JWT_SECRET} -ge 32 ]; then echo '✓ Valid length'; else echo '⚠ Too short'; fi)"
    print_status "  News API: $(if [ ! -z "$NEWS_API_KEY" ]; then echo '✓ Configured'; else echo '⚠ Not set'; fi)"
}

# Create a template .env file
create_env_template() {
    cat > .env << EOF
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=climate_platform
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret (at least 32 random characters)
JWT_SECRET=your_super_secret_jwt_key_here_must_be_at_least_32_characters_long

# News API Key (optional but recommended for news functionality)
NEWS_API_KEY=your_news_api_key_here

# Port Configuration (optional, defaults to 5000 for backend)
PORT=5000
EOF
    
    print_success ".env template created. Please update with your actual values."
}

# Install dependencies for both root and client
install_dependencies() {
    print_status "Installing root dependencies..."
    
    # Install root dependencies
    if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
        if [ -f "package-lock.json" ]; then
            print_status "Using npm to install root dependencies..."
            npm install
        else
            print_status "Using yarn to install root dependencies..."
            yarn install
        fi
    else
        print_status "No lock file found, installing with npm..."
        npm install
    fi
    
    print_success "Root dependencies installed successfully."
    
    # Install client dependencies
    if [ -d "client" ]; then
        print_status "Installing client dependencies..."
        cd client
        
        if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
            if [ -f "package-lock.json" ]; then
                print_status "Using npm to install client dependencies..."
                npm install
            else
                print_status "Using yarn to install client dependencies..."
                yarn install
            fi
        else
            print_status "No lock file found in client, installing with npm..."
            npm install
        fi
        
        cd ..
        print_success "Client dependencies installed successfully."
    else
        print_warning "Client directory not found. Skipping client dependencies installation."
    fi
}

# Check if Prisma is used and apply migrations if needed
handle_database_setup() {
    print_status "Checking for database setup requirements..."
    
    # Check if Prisma is configured
    if [ -f "prisma/schema.prisma" ]; then
        print_status "Prisma schema detected. Checking for migrations..."
        
        if command -v npx &> /dev/null; then
            # Run pending migrations
            print_status "Applying database migrations..."
            npx prisma migrate dev --name init
            print_success "Database migrations applied successfully."
        else
            print_error "npx is not available. Cannot run Prisma migrations."
            exit 1
        fi
    elif [ -f "db_schema.sql" ]; then
        print_status "SQL schema file (db_schema.sql) detected."
        print_status "Setting up database using SQL schema..."
        
        # Check if psql is available
        if command -v psql &> /dev/null; then
            # Connect to PostgreSQL and import schema
            print_status "Importing database schema..."
            
            # Create database if it doesn't exist
            if [ ! -z "$DB_NAME" ]; then
                print_status "Creating database $DB_NAME if it doesn't exist..."
                
                # Check if database exists
                DB_EXISTS=$(psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" 2>/dev/null)
                
                if [ "$DB_EXISTS" != "1" ]; then
                    print_status "Creating database $DB_NAME..."
                    psql -c "CREATE DATABASE $DB_NAME;" -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT"
                    print_success "Database $DB_NAME created successfully."
                else
                    print_status "Database $DB_NAME already exists."
                fi
                
                # Import schema
                print_status "Importing schema from db_schema.sql..."
                psql -d "$DB_NAME" -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -f db_schema.sql
                print_success "Database schema imported successfully."
            else
                print_warning "DB_NAME is not set. Skipping database creation and schema import."
                print_status "You may need to manually import db_schema.sql to your PostgreSQL database."
            fi
        else
            print_warning "psql is not available. Skipping automatic database setup."
            print_status "You will need to manually import db_schema.sql to your PostgreSQL database."
            print_status "Example command: psql -d climate_platform -U postgres -f db_schema.sql"
        fi
    else
        print_status "No Prisma or SQL schema files detected. Assuming manual database setup."
    fi
}

# Build the frontend if needed
build_frontend() {
    if [ -d "client" ]; then
        print_status "Building frontend for production..."
        cd client
        
        # Check if build command exists in package.json
        if grep -q '"build"' package.json; then
            npm run build
            print_success "Frontend built successfully."
        else
            print_warning "No build script found in client package.json."
        fi
        
        cd ..
    fi
}

# Start the development servers
start_dev_servers() {
    print_status "Starting development servers..."
    
    # Check if concurrently is available
    if ! npm list --depth=0 | grep -q "concurrently"; then
        print_warning "concurrently not found in root. Installing temporarily..."
        npm install --no-save concurrently
    fi
    
    # Start both servers concurrently
    print_status "Starting backend and frontend development servers..."
    print_status "Backend will run on http://localhost:${PORT:-5000}"
    print_status "Frontend will run on http://localhost:5173"
    print_status ""
    print_status "Press Ctrl+C to stop the servers."
    print_status ""
    
    # Use the existing dev script if available
    if grep -q '"dev"' package.json; then
        print_status "Using npm run dev script to start servers concurrently..."
        npm run dev
    else
        # Fallback: start servers manually
        print_status "Starting servers manually..."
        (
            cd client
            print_status "Starting frontend development server..."
            npm run dev &
        ) &
        sleep 3  # Give frontend a moment to start
        print_status "Starting backend development server..."
        npm run server
    fi
}

# Main execution flow
main() {
    print_header
    
    print_status "Starting ClimateHub Development Environment Setup..."
    print_status ""
    
    check_os
    check_node_version
    check_and_free_port 5000 "Backend"
    check_and_free_port 5173 "Frontend"
    check_and_free_port 3000 "Fallback Frontend"
    validate_environment_variables
    install_dependencies
    handle_database_setup
    build_frontend
    
    print_success "Setup completed successfully!"
    print_status ""
    print_success "✓ Environment variables validated"
    print_success "✓ Dependencies installed"
    print_success "✓ Database setup handled"
    print_success "✓ Frontend built"
    print_status ""
    print_status "To start the development servers, run:"
    print_status "  cd /workspace && npm run dev"
    print_status ""
    print_status "Or run this script again with the 'start' argument:"
    print_status "  ./setup-dev-environment.sh start"
    print_status ""
    
    # If 'start' argument is provided, start the development servers
    if [ "$1" = "start" ]; then
        print_status ""
        print_status "Starting development servers..."
        start_dev_servers
    fi
}

# Run the main function with all arguments
main "$@"