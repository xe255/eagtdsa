# 🔐 Admin Panel Documentation

## Overview

The bot includes a comprehensive **button-based admin panel** accessible only to authorized administrators. All admin features are accessible through interactive buttons - no text commands needed!

## Access Control

Only users with the `ADMIN_CHAT_ID` (set in `.env` file) can access admin features.

The admin panel button appears automatically in the main menu for authorized administrators.

## Accessing the Admin Panel

### From Main Menu
1. Send `/start` to the bot
2. Click the **🔐 פאנל אדמין** button (visible only to admin)
3. Navigate through the button menu

**Main Menu Features:**
- 📊 **Statistics** - View system statistics
- 👥 **User Management** - Browse and manage users
- 📢 **Broadcasting** - Send messages to all users
- 💼 **Account Management** - View account statistics
- 🚫 **Blacklist Management** - Manage blocked users
- 🌐 **Dashboard Access** - Link to web dashboard

## Admin Panel Features

### 📊 Statistics View

**Displays:**

**General Statistics:**
- Total users
- Total accounts created
- Active accounts
- Success rate
- Blacklisted users

**Last 24 Hours:**
- Active users
- New accounts created

**Last 7 Days:**
- Active users
- New accounts created

### 👥 User Management

**How it works:**
1. Click **👥 משתמשים** in admin panel
2. See list of all users as buttons
3. Click on any user to view details

**User Details View:**
- Full name with clickable Telegram link
- User ID
- Telegram username
- Account count and status
- Last activity
- Blacklist status

**Available Actions:**
- 🚫 **Ban User** - Block access (with conversation for reason)
- ✅ **Unban User** - Remove from blacklist
- 💬 **Send Message** - Direct message to user

### 📢 Broadcasting

**How it works:**
1. Click **📢 שידור הודעה** in admin panel
2. Bot shows recipient count and confirmation
3. Send your message text
4. Bot broadcasts to all active users
5. View delivery statistics

**Features:**
- Automatic blacklist filtering
- Real-time delivery statistics
- Rate limiting protection
- Shows sent/failed/blocked counts

### 💼 Account Management

**Displays:**
- Total accounts in system
- Active accounts
- Expired accounts
- Users with accounts
- Average accounts per user
- Active account percentage

### 🚫 Blacklist Management

**How it works:**
1. Click **🚫 חסומים** in admin panel
2. See all blocked users as buttons
3. Click on user to view details and unban

**Features:**
- View all blacklisted users
- See blacklist reasons
- One-click access to user details
- Quick unban functionality

**Banning a User:**
1. Go to user management
2. Select user from list
3. Click **🚫 חסום משתמש**
4. Type the reason for blocking
5. User is immediately blocked

**User Experience for Blacklisted Users:**
- Cannot create new accounts
- Cannot use bot features
- Receives "🚫 אינך מורשה להשתמש בבוט זה" message

## Security Features

### Admin Authentication
- Only configured admin can access features
- All admin commands check permissions
- Non-admins receive "⛔ אין לך הרשאות אדמין" message

### Blacklist Protection
- Automatic checking on all user actions
- Prevents account creation
- Blocks all bot interactions
- Maintains blacklist in database

### Audit Trail
- All admin actions are logged
- Blacklist includes:
  - Who added the user
  - When they were added
  - Reason for blocking

## Dashboard Integration

The admin panel works alongside the web dashboard:
- 🌐 Click "Dashboard" button in admin panel
- Opens web interface at `http://localhost:3000`
- Both interfaces share the same database
- Real-time updates via WebSocket

## Database Structure

### Blacklist Entry
```json
{
  "chatId": "123456789",
  "reason": "Spam",
  "addedBy": "987654321",
  "addedAt": "2026-02-11T00:00:00.000Z"
}
```

### Statistics Tracking
All admin actions are tracked in logs for:
- Success rate calculations
- Activity monitoring
- Performance metrics
- Audit trails

## Best Practices

### User Management
1. **Document reasons** - Always provide a reason when banning users
2. **Review regularly** - Periodically review blacklist
3. **Communicate** - Use broadcast to inform users of changes

### Broadcasting
1. **Be concise** - Keep messages short and clear
2. **Test first** - Consider testing with small group
3. **Timing** - Send at appropriate times for your users
4. **Frequency** - Don't spam users with broadcasts

### Security
1. **Protect admin ID** - Keep `ADMIN_CHAT_ID` secure
2. **Review logs** - Regularly check admin dashboard for suspicious activity
3. **Backup data** - Regularly backup `db.json`

## Troubleshooting

### "אין לך הרשאות אדמין"
- Check that your Chat ID matches `ADMIN_CHAT_ID` in `.env`
- Restart the bot after changing `.env`
- Verify environment variables are loaded correctly

### Broadcast not sending
- Check user count with `/list`
- Verify users aren't all blacklisted
- Check bot logs for rate limiting errors

### Statistics not updating
- Statistics update in real-time
- Try clicking "🔙 חזרה לתפריט" and reopening
- Check database file for corruption

## Admin Panel Workflow

1. **Start:** Send `/start` and click **🔐 פאנל אדמין**
2. **Review:** Check statistics and user activity via buttons
3. **Manage:** Click users to view details and take actions
4. **Communicate:** Use broadcast button for announcements
5. **Monitor:** Review account statistics through buttons
6. **Maintain:** Manage blacklist through user details

## Button Navigation

All features are accessible through buttons:
- ✅ **No text commands needed**
- ✅ **Visual menu system**
- ✅ **Back buttons for easy navigation**
- ✅ **Confirmation prompts for sensitive actions**
- ✅ **Real-time feedback**

## Future Enhancements

Potential features for future updates:
- User groups/categories
- Scheduled broadcasts
- Export statistics to CSV
- Advanced filtering options
- Custom user limits per user
- Analytics dashboard
- Webhook notifications

---

**Version:** 1.0  
**Last Updated:** 2026-02-11  
**Admin Access:** Via `ADMIN_CHAT_ID` environment variable
