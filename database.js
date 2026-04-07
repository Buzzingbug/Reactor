const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:database.sqlite',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Initialize tables
const initDb = async () => {
    try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS channel_configs (
            channel_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            media_emojis TEXT,
            text_emojis TEXT,
            link_emojis TEXT,
            role_id TEXT,
            order_matter INTEGER DEFAULT 1
          )
        `);
        console.log('Database initialized successfully.');
    } catch (e) {
        console.error('Database initialization error: ', e);
    }
};

const getChannelConfig = async (channelId) => {
    const rs = await client.execute({
        sql: 'SELECT * FROM channel_configs WHERE channel_id = ?',
        args: [channelId]
    });
    return rs.rows[0];
};

const getAllConfigs = async (guildId) => {
    if (guildId) {
        const rs = await client.execute({
            sql: 'SELECT * FROM channel_configs WHERE guild_id = ?',
            args: [guildId]
        });
        return rs.rows;
    }
    const rs = await client.execute('SELECT * FROM channel_configs');
    return rs.rows;
};

const updateChannelConfig = async (config) => {
  const { channel_id, guild_id, enabled, media_emojis, text_emojis, link_emojis, role_id, order_matter } = config;
  
  const stmt = {
    sql: `
        INSERT INTO channel_configs (channel_id, guild_id, enabled, media_emojis, text_emojis, link_emojis, role_id, order_matter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(channel_id) DO UPDATE SET
        enabled = excluded.enabled,
        media_emojis = excluded.media_emojis,
        text_emojis = excluded.text_emojis,
        link_emojis = excluded.link_emojis,
        role_id = excluded.role_id,
        order_matter = excluded.order_matter
    `,
    args: [channel_id, guild_id, (enabled ? 1 : 0), media_emojis, text_emojis, link_emojis, role_id, (order_matter ? 1 : 0)]
  };
  
  return await client.execute(stmt);
};

const toggleChannel = async (channelId, enabled) => {
    return await client.execute({
        sql: 'UPDATE channel_configs SET enabled = ? WHERE channel_id = ?',
        args: [enabled ? 1 : 0, channelId]
    });
};

// Start initialization
initDb();

module.exports = {
  getChannelConfig,
  updateChannelConfig,
  toggleChannel,
  getAllConfigs
};
