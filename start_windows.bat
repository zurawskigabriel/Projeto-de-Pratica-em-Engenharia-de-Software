@echo off

REM Get local IP address
for /f "tokens=1-2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
  for /f "tokens=*" %%c in ("%%b") do (
    set IP_ADDRESS=%%c
  )
)
echo IP Address: %IP_ADDRESS%

REM Update API endpoint in frontend
set API_FILE=Frontend\src\api\api.ts

REM Create a temporary file for sed
set TEMP_FILE=temp_api.ts

REM Replace BASE_URL
powershell -Command "(Get-Content %API_FILE%) -replace 'const BASE_URL = \".*\";', 'const BASE_URL = \"http://%IP_ADDRESS%:8080/api\";' | Set-Content %TEMP_FILE%"
move /Y %TEMP_FILE% %API_FILE%

REM Replace MATCH_ALLAN_URL
powershell -Command "(Get-Content %API_FILE%) -replace 'const MATCH_ALLAN_URL = \".*\";', 'const MATCH_ALLAN_URL = \"http://%IP_ADDRESS%:9000\";' | Set-Content %TEMP_FILE%"
move /Y %TEMP_FILE% %API_FILE%

echo API endpoints updated in %API_FILE%

REM Start Spring Boot service
echo Starting Spring Boot service...
cd api-principal
start "Spring Boot" cmd /c mvnw spring-boot:run
cd ..

REM Install Python dependencies and start Python service
echo Starting Python service...
cd match
pip install -r requirements.txt
start "Python FastAPI" cmd /c python -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
cd ..

REM Install Node.js dependencies and start frontend service
echo Starting frontend service...
cd Frontend
call npm install
start "Frontend" cmd /c npm start
cd ..

echo All services started.
