#!/bin/bash

echo "🍎 Setting up Fruit App..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

# Create .env file from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "✅ Please update .env with your MongoDB URI and JWT secret"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Update .env file with your MongoDB URI and JWT secret"
echo "2. Start MongoDB (if using local instance)"
echo "3. Run: npm run dev (for backend)"
echo "4. Run: cd client && npm start (for frontend)"
echo ""
echo "The app will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
