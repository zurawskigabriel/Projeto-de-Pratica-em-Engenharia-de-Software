#!/bin/bash

# Get local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Update API endpoint in frontend
API_FILE="Frontend/src/api/api.ts"
sed -i "s|const BASE_URL = \".*\";|const BASE_URL = \"http://$IP_ADDRESS:8080/api\";|" $API_FILE
sed -i "s|const MATCH_ALLAN_URL = \".*\";|const MATCH_ALLAN_URL = \"http://$IP_ADDRESS:9000\";|" $API_FILE

echo "API endpoints updated with IP: $IP_ADDRESS"

# Start Spring Boot service
echo "Starting Spring Boot service..."
cd api-principal
./mvnw spring-boot:run &
SPRING_PID=$!
cd ..

# Install Python dependencies and start Python service
echo "Starting Python service..."
cd match
pip install fastapi uvicorn openai python-dotenv
python -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload &
PYTHON_PID=$!
cd ..

# Install Node.js dependencies and start frontend service
echo "Starting frontend service..."
cd Frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo "All services started."
echo "Spring Boot PID: $SPRING_PID"
echo "Python PID: $PYTHON_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for all background processes to finish
wait $SPRING_PID
wait $PYTHON_PID
wait $FRONTEND_PID
