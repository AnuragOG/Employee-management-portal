#!/bin/bash
echo "🚀 Starting Anurag Software Solutions Portal..."
echo ""
echo "Starting backend server..."
cd server && npm install && npm start &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
echo ""
sleep 2
echo "Starting frontend client..."
cd ../client && npm install && npm start &
CLIENT_PID=$!
echo ""
echo "✅ Both servers started!"
echo "📌 Backend: http://localhost:5000"
echo "📌 Frontend: http://localhost:3000"
echo "🔑 Login: admin@anurag.com / admin123"
echo ""
echo "Press Ctrl+C to stop all servers"
wait
