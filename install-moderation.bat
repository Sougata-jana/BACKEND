@echo off
echo ===================================
echo  Installing Content Moderation
echo  (FREE - No AWS/AI Service)
echo ===================================
echo.

cd backend

echo [1/3] Installing TensorFlow...
call npm install @tensorflow/tfjs-node

echo.
echo [2/3] Installing NSFW.js...
call npm install nsfwjs

echo.
echo [3/3] Installing Sharp (Image Processing)...
call npm install sharp

echo.
echo ===================================
echo  Installation Complete! ✓
echo ===================================
echo.
echo Next steps:
echo 1. Start your backend: cd backend ^&^& npm run dev
echo 2. The AI model will download automatically (takes 30 seconds first time)
echo 3. Upload feature now has content moderation!
echo.
pause
