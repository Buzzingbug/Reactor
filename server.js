const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();
const { getAllConfigs, updateChannelConfig, toggleChannel } = require('./database');
const client = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Health Check for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Main Dashboard Route
app.get('/', async (req, res) => {
  if (!client.isReady()) {
    return res.send('Bot is still starting up... Please refresh in a few seconds.');
  }

  const selectedGuildId = req.query.guild;
  const guilds = client.guilds.cache.map(g => ({ id: g.id, name: g.name, icon: g.iconURL() }));
  
  const configs = await getAllConfigs(selectedGuildId);
  
  const transformedConfigs = await Promise.all(configs.map(async (config) => {
    try {
        const channel = await client.channels.fetch(config.channel_id);
        const guild = await client.guilds.fetch(config.guild_id);
        return {
          ...config,
          channelName: channel ? channel.name : 'Unknown Channel',
          guildName: guild ? guild.name : 'Unknown Guild'
        };
    } catch (e) {
        return {
            ...config,
            channelName: 'Deleted/Inaccessible Channel',
            guildName: 'Unknown Guild'
        };
    }
  }));

  res.render('dashboard', { 
      configs: transformedConfigs, 
      guilds: guilds,
      selectedGuildId: selectedGuildId 
  });
});

// Update Channel Logic (via AJAX)
app.post('/api/update', async (req, res) => {
  const { channel_id, field, value } = req.body;
  const currentConfigs = await getAllConfigs();
  const currentConfig = currentConfigs.find(c => c.channel_id === channel_id);
  
  if (!currentConfig) return res.status(404).json({ error: 'Config not found' });

  const updatedConfig = { ...currentConfig, [field]: value };
  await updateChannelConfig(updatedConfig);
  res.json({ success: true });
});

// Toggle Logic
app.post('/api/toggle', async (req, res) => {
    const { channel_id, enabled } = req.body;
    await toggleChannel(channel_id, enabled);
    res.json({ success: true });
});

app.listen(PORT, () => {
     console.log(`Dashboard running on http://localhost:${PORT}`);
     client.login(process.env.TOKEN);
 });
+
+// Graceful Shutdown
+process.on('SIGTERM', () => {
+    console.log('SIGTERM signal received: closing HTTP server');
+    process.exit(0);
+});
