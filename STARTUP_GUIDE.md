# 🚀 Startup Guide - How to Run embyIL Bot

## 📋 Quick Reference

| Method | File to Use | When to Use |
|--------|-------------|-------------|
| **Windows (Double-click)** | `start.bat` | ✅ Easiest - just double-click |
| **PowerShell/Terminal** | `start.ps1` | Terminal users |
| **Direct Command** | `node app.js` | Advanced users |

---

## ✅ Method 1: Using start.bat (RECOMMENDED)

**Best for:** Most users, easy startup

### Steps:
1. Open File Explorer
2. Navigate to: `C:\Users\David\Downloads\embyil`
3. **Double-click** `start.bat`
4. A green console window opens
5. Wait for "הבוט פועל..." message
6. Bot is running! ✅

### What it does:
- ✅ Automatically stops old bot instances
- ✅ Checks and installs dependencies
- ✅ Verifies `.env` file exists
- ✅ Starts the bot
- ✅ Shows dashboard URL

### To stop:
- Press **Ctrl+C** in the console window
- Or just **close the window**
- Or double-click `stop.bat`

---

## 🔷 Method 2: Using start.ps1 (For PowerShell Users)

**Best for:** Running from Cursor terminal or PowerShell

### Steps:
1. Open PowerShell or Cursor Terminal (Ctrl+`)
2. Navigate to project:
   ```powershell
   cd C:\Users\David\Downloads\embyil
   ```
3. Run:
   ```powershell
   .\start.ps1
   ```
4. Bot starts in the same terminal

### To stop:
- Press **Ctrl+C** in the terminal

---

## 💻 Method 3: Direct Node Command

**Best for:** Developers who want direct control

### Steps:
```powershell
# Stop any existing instances first
taskkill /F /IM node.exe /T

# Wait a moment
Start-Sleep -Seconds 2

# Start bot
node app.js
```

### To stop:
- Press **Ctrl+C**

---

## 🛑 Stopping the Bot

### Option 1: stop.bat (Easiest)
1. Double-click `stop.bat`
2. All bot instances are stopped

### Option 2: From Console
- Press **Ctrl+C** in the bot window

### Option 3: Task Manager
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find `node.exe` processes
3. End task

### Option 4: PowerShell Command
```powershell
taskkill /F /IM node.exe /T
```

---

## ⚠️ Common Issues

### Issue: "409 Conflict: terminated by other getUpdates"
**Cause:** Multiple bot instances running  
**Solution:** 
1. Double-click `stop.bat`
2. Wait 2-3 seconds
3. Double-click `start.bat` again

### Issue: "ERROR: TELEGRAM_BOT_TOKEN is not set"
**Cause:** Missing or incorrect `.env` file  
**Solution:**
1. Check `.env` file exists
2. Verify `TELEGRAM_BOT_TOKEN` is set
3. Compare with `.env.example`

### Issue: Console closes immediately
**Cause:** Error during startup  
**Solution:**
1. Run from terminal to see errors:
   ```powershell
   .\start.ps1
   ```
2. Check error messages
3. Fix issues shown

### Issue: Port 3000 already in use
**Cause:** Another application using port 3000  
**Solution:**
1. Stop other application
2. Or change PORT in `.env` to different port (e.g., 3001)

---

## ✅ Verify Bot is Running

Check all these:

### 1. Console Output
Should show:
```
הבוט פועל...
Admin Dashboard running at http://localhost:3000
```

### 2. Telegram Bot
- Open Telegram
- Send `/start` to your bot
- Bot should respond immediately

### 3. Dashboard
- Open browser
- Go to: http://localhost:3000
- Dashboard should load

### 4. Process Manager
```powershell
Get-Process node
```
Should show at least one `node.exe` process

---

## 🔄 Auto-Restart on Changes

If you're developing and want auto-restart on file changes:

### Install nodemon:
```bash
npm install -g nodemon
```

### Run with nodemon:
```bash
nodemon app.js
```

---

## 🐳 Docker Alternative

If you want to run in Docker:

```bash
docker build -t embyil-bot .
docker run -d --env-file .env -p 3000:3000 embyil-bot
```

---

## 📊 Monitoring

### Check if bot is running:
```powershell
Get-Process node
```

### Check port 3000:
```powershell
netstat -ano | Select-String ":3000"
```

### View logs:
- Bot logs appear in console
- Dashboard: http://localhost:3000

---

## 🎯 Best Practices

1. **Always stop old instances** before starting new ones
2. **Use start.bat** for simplicity
3. **Keep `.env` file** secure and up to date
4. **Monitor console** for errors
5. **Test bot** after every restart

---

## 💡 Quick Tips

- **First time?** Use `start.bat` - it's the simplest
- **Developing?** Use `start.ps1` from terminal for better output
- **Deploying?** Use Docker or Zeabur
- **Multiple restarts?** `stop.bat` then `start.bat`

---

**Last Updated:** 2026-02-11  
**Status:** ✅ All startup methods tested and working
