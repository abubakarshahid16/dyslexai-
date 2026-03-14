# Screenshots

Screenshots for the README and FYP submission.

## Automated Capture (Recommended)

1. Run the app: `.\scripts\run-simple.ps1`
2. Wait for backend (8000) and frontend (5173) to be ready
3. From project root:
   ```powershell
   cd frontend
   npm run screenshots
   ```
   (If `node` is not in PATH, add `.\tools\node-v24.11.0-win-x64` first.)
4. Screenshots are saved to `docs/screenshots/`

## Manual Capture

1. Run the app: `.\scripts\run-simple.ps1`
2. Open http://localhost:5173
3. Sign up and log in
4. Navigate to each page and capture (e.g. Win+Shift+S or browser dev tools)

## Naming Convention

- 01-landing.png
- 02-login.png
- 03-signup.png
- 04-dashboard.png
- 05-workspace-upload.png
- 06-ocr-result.png
- 07-history.png
- 08-exercises.png
- 09-game-mode.png
- 10-students.png
- 11-settings.png
