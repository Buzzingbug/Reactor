# 🤖 Auto Reacter Bot & Dashboard

A premium, highly-customizable Discord bot for automatic emoji reactions. Configure reactions based on content type (Media, Links, Text) with a sleek glassmorphism dashboard.

## ✨ Features

- **Content-Aware Reactions**: Separate emoji sets for images/files, links, and text.
- **Ordered Flow**: Add emojis in the exact order specified.
- **Role Control**: Restrict reactions to messages from specific roles.
- **Modern Dashboard**: Real-time management of channel configurations.
- **Slash Commands**: Quick setup and toggling directly in Discord.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Edit the `.env` file with your Discord Bot Token and Turso Database credentials.
   ```env
   TOKEN=your_token
   DATABASE_URL=libsql://your-db.turso.io
   DATABASE_AUTH_TOKEN=your_auth_token
   ```

3. **Required Intents**:
   Ensure `Guilds`, `GuildMessages`, `MessageContent`, and `GuildMessageReactions` are enabled in the Discord Developer Portal.

4. **Run the Bot**:
   ```bash
   node server.js
   ```

## 🚀 Deployment (Railway)

Moving the bot to Railway is straightforward:

1. **Connect GitHub**: Connect your repository to a new Railway project.
2. **Variables**: Add the following Environment Variables in the Railway dashboard:
   - `TOKEN`: Your Discord Bot Token.
   - `DATABASE_URL`: Your Turso DB URL.
   - `DATABASE_AUTH_TOKEN`: Your Turso Auth Token.
3. **Automatic Deploy**: Railway will detect `package.json` and `railway.json` to start the bot automatically.

## 🎮 Discord Commands

- `/setup-reactions`: The primary configuration tool.
  - `role`: (Optional) Only react to messages from this role.
  - `media`: Emojis for messages with attachments (e.g., `🔥,❤️`).
  - `link`: Emojis for messages containing URLs (e.g., `🔗,👀`).
  - `text`: Emojis for plain text (e.g., `👍`).
  - `ordered`: Boolean. If true, adds emojis sequentially.
- `/toggle-reactions`: Quick on/off switch for the current channel.
- `/status-reactions`: Check the current settings for a channel.

## 🖥️ Dashboard

Access the dashboard at `http://localhost:3000` once the bot is running.
The dashboard provides a visual overview of all configured channels and allows quick toggling of the bot's activity.

## 🎯 Reference
Inspired by [AutoReacter](https://autoreacter.com/#features).
