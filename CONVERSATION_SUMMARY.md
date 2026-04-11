# 📋 Project Status: Auto Reacter Bot

Use this file to quickly resume our conversation or understand the bot's architecture.

## 🚀 Current Status
- **Live & Operational**: The bot is deployed on **Render**.
- **Database**: Connected to **Turso (LibSQL)** for cloud persistence.
- **GitHub**: All code is pushed to `https://github.com/mokuzai96/Reactor.git`.
- **Latest Feature**: Added `/edit-reactions` command for selective configuration updates.

## 🏗️ Technical Architecture
- **Language**: Node.js (v14+)
- **Library**: `discord.js` v14
- **Dashboard**: Express + EJS (Glassmorphism design).
- **Database**: @libsql/client (Turso).
- **Environment**: Managed via `.env` (locally) and Render Environment Variables (live).

## 🛠️ Essential Commands
- `/setup-reactions`: Initial configuration (Media, Link, Text).
- `/edit-reactions`: Modify specific parts of an existing setup.
- `/toggle-reactions`: Enable/Disable bot in a channel.
- `/status-reactions`: View current settings.

## 🔗 Project Links
- **Dashboard**: [https://reactor-ev80.onrender.com](https://reactor-ev80.onrender.com)
- **Repo**: [GitHub: mokuzai96/Reactor](https://github.com/mokuzai96/Reactor)
- **Database**: Manage at [turso.tech](https://turso.tech)

## 📌 Where We Left Off
We successfully migrated the bot from a local VPS strategy to a **Render + Turso** cloud strategy. The bot is fully functional, supporting multi-server setups and content-aware reactions. The dashboard includes a sidebar for server switching.

**Next possible steps**:
- Adding keyword-based reactions.
- Implementing an "Ignore User" or "Ignore Role" feature.
- Expanding the dashboard to allow emoji editing directly via the web.
