@echo off
echo ========================================
echo Fixing Large Files for GitHub Upload
echo ========================================
echo.

echo Step 1: Removing large files from Git cache...
git rm --cached -r node_modules/ 2>nul
git rm --cached -r sessions/ 2>nul
git rm --cached cloudflared.exe 2>nul
git rm --cached chatbot20-21e3a-firebase-adminsdk-*.json 2>nul
git rm --cached settings.json 2>nul
REM package-lock.json should be tracked, so we don't remove it

echo.
echo Step 2: Checking for files larger than 50MB...
for /f "tokens=*" %%i in ('git ls-files -s ^| findstr /v "^160000"') do (
    for /f "tokens=4" %%j in ("%%i") do (
        set size=%%j
        if !size! GTR 52428800 (
            echo Warning: Large file detected: %%j
        )
    )
)

echo.
echo Step 3: Updating .gitignore...
echo .gitignore has been updated to exclude large files.

echo.
echo Step 4: Staging .gitignore...
git add .gitignore

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Review what will be committed: git status
echo 2. Commit the changes: git commit -m "Update .gitignore to exclude large files"
echo 3. If you already pushed large files, you may need to:
echo    - Use git filter-branch or BFG Repo-Cleaner to remove them
echo    - Or create a fresh repository
echo.
pause

