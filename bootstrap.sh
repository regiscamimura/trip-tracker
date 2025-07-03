#!/bin/bash

# Trip Tracker Bootstrap Script
# This script sets up the entire application for development

set -e  # Exit on any error

echo "🚛 Trip Tracker Bootstrap Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first: npm install -g pnpm"
        exit 1
    fi
    
    if ! command -v uv &> /dev/null; then
        print_error "uv is not installed. Please install uv first: pip install uv"
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    uv sync
    
    # Run migrations
    print_status "Running database migrations..."
    uv run python manage.py migrate
    
    # Load fixtures
    print_status "Loading fixtures..."
    uv run python manage.py loaddata user_driver.json
    uv run python manage.py loaddata truck.json
    uv run python manage.py loaddata trailer.json
    
    print_success "Backend setup complete!"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    pnpm install
    
    # Generate API types (optional, but recommended)
    print_status "Generating API types..."
    if curl -s http://localhost:8000/api/openapi.json > /dev/null 2>&1; then
        pnpm generate-types
        print_success "API types generated!"
    else
        print_warning "Backend not running, skipping API type generation"
        print_warning "Run 'pnpm generate-types' manually after starting the backend"
    fi
    
    print_success "Frontend setup complete!"
    cd ..
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend in background
    print_status "Starting Django backend on http://localhost:8000"
    cd backend
    nohup uv run python manage.py runserver > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 5
    
    # Start frontend in background
    print_status "Starting React frontend on http://localhost:5173"
    cd frontend
    nohup pnpm dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Store PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "Services started!"
    print_status "Backend PID: $BACKEND_PID"
    print_status "Frontend PID: $FRONTEND_PID"
}

# Main execution
main() {
    check_prerequisites
    setup_backend
    setup_frontend
    start_services
    
    echo ""
    echo "🎉 Trip Tracker is ready!"
    echo "=========================="
    echo "Backend:  http://localhost:8000"
    echo "Frontend: http://localhost:5173"
    echo "API Docs: http://localhost:8000/api/docs"
    echo ""
    echo "To stop the services, run: ./stop.sh"
    echo "To view logs, check the terminal output above"
    
    # Services are now running in the background
    print_status "Services are running in the background!"
    print_status "Check backend.log and frontend.log for service logs"
    print_status "Run './stop.sh' to stop all services"
    
    # Exit successfully
    exit 0
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
}

# Trap to cleanup on script exit (only for errors)
trap cleanup ERR

# Run main function
main "$@" 