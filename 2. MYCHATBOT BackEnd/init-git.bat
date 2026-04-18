@echo off
echo Initializing Git repository...
git init

echo.
echo Adding files to Git...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit: WhatsApp Assistant Pro project"

echo.
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Create a repository on GitHub/GitLab/Bitbucket
echo 2. Add the remote: git remote add origin YOUR_REPO_URL
echo 3. Push your code: git push -u origin main
echo.
pause

