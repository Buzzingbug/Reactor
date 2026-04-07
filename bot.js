const { Client, GatewayIntentBits, Partials, Collection, Events, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { getChannelConfig, updateChannelConfig, toggleChannel } = require('./database');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// Configuration Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('setup-reactions')
    .setDescription('Configure auto reactions for this channel')
    .addRoleOption(option => option.setName('role').setDescription('Role that triggers the reaction (if any)').setRequired(false))
    .addStringOption(option => option.setName('media').setDescription('Emojis for media (e.g. 🔥,❤️) - space or comma separated').setRequired(false))
    .addStringOption(option => option.setName('link').setDescription('Emojis for links (e.g. 🔗,👀)').setRequired(false))
    .addStringOption(option => option.setName('text').setDescription('Emojis for text messages (e.g. 👍,✅)').setRequired(false))
    .addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable auto reactions').setRequired(false))
    .addBooleanOption(option => option.setName('ordered').setDescription('Should emojis be added in the specified order?').setRequired(false)),
  new SlashCommandBuilder()
    .setName('toggle-reactions')
    .setDescription('Quick toggle auto reactions for this channel')
    .addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable auto reactions').setRequired(true)),
  new SlashCommandBuilder()
    .setName('status-reactions')
    .setDescription('View current auto reaction settings for this channel'),
  new SlashCommandBuilder()
    .setName('edit-reactions')
    .setDescription('Edit specific settings without resetting the whole configuration')
    .addRoleOption(option => option.setName('role').setDescription('Update the required role').setRequired(false))
    .addStringOption(option => option.setName('media').setDescription('Update media emojis').setRequired(false))
    .addStringOption(option => option.setName('link').setDescription('Update link emojis').setRequired(false))
    .addStringOption(option => option.setName('text').setDescription('Update text emojis').setRequired(false))
    .addBooleanOption(option => option.setName('enabled').setDescription('Enable/Disable reactions').setRequired(false))
    .addBooleanOption(option => option.setName('ordered').setDescription('Should emojis be added in order?').setRequired(false)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot is ready! Logged in as ${c.user.tag}`);
  
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(c.user.id), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// Helper for parsing emojis
const parseEmojis = (emojiString) => {
    if (!emojiString) return null;
    // Split by comma or space
    return emojiString.split(/[\s,]+/).filter(e => e.trim().length > 0);
};

// Interaction Handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'setup-reactions') {
    const roleId = interaction.options.getRole('role')?.id || null;
    const media = interaction.options.getString('media') || null;
    const link = interaction.options.getString('link') || null;
    const text = interaction.options.getString('text') || null;
    const enabled = interaction.options.getBoolean('enabled') ?? true;
    const ordered = interaction.options.getBoolean('ordered') ?? true;

    await updateChannelConfig({
      channel_id: interaction.channelId,
      guild_id: interaction.guildId,
      enabled: enabled ? 1 : 0,
      media_emojis: media,
      text_emojis: text,
      link_emojis: link,
      role_id: roleId,
      order_matter: ordered ? 1 : 0
    });

    const embed = new EmbedBuilder()
      .setTitle('Auto Reactions Configured')
      .setColor('#3498db')
      .setDescription(`Settings updated for <#${interaction.channelId}>`)
      .addFields(
        { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
        { name: 'Role Required', value: roleId ? `<@&${roleId}>` : 'No specific role', inline: true },
        { name: 'Media Emojis', value: media || 'None', inline: false },
        { name: 'Link Emojis', value: link || 'None', inline: false },
        { name: 'Text Emojis', value: text || 'None', inline: false },
        { name: 'Order Matters', value: ordered ? 'Yes' : 'No', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'edit-reactions') {
    const currentConfig = await getChannelConfig(interaction.channelId);
    
    if (!currentConfig) {
      return interaction.reply({ content: 'No configuration found for this channel. Please use `/setup-reactions` first.', ephemeral: true });
    }

    const updates = {
      channel_id: interaction.channelId,
      guild_id: interaction.guildId,
      role_id: interaction.options.getRole('role')?.id ?? currentConfig.role_id,
      media_emojis: interaction.options.getString('media') ?? currentConfig.media_emojis,
      link_emojis: interaction.options.getString('link') ?? currentConfig.link_emojis,
      text_emojis: interaction.options.getString('text') ?? currentConfig.text_emojis,
      enabled: interaction.options.getBoolean('enabled') !== null ? (interaction.options.getBoolean('enabled') ? 1 : 0) : currentConfig.enabled,
      order_matter: interaction.options.getBoolean('ordered') !== null ? (interaction.options.getBoolean('ordered') ? 1 : 0) : currentConfig.order_matter
    };

    await updateChannelConfig(updates);

    const embed = new EmbedBuilder()
      .setTitle('Configuration Updated')
      .setColor('#f1c40f')
      .setDescription(`Settings for <#${interaction.channelId}> have been updated.`)
      .addFields(
        { name: 'Status', value: updates.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
        { name: 'Role Required', value: updates.role_id ? `<@&${updates.role_id}>` : 'None', inline: true },
        { name: 'Media', value: updates.media_emojis || 'Not set', inline: false },
        { name: 'Link', value: updates.link_emojis || 'Not set', inline: false },
        { name: 'Text', value: updates.text_emojis || 'Not set', inline: false },
        { name: 'Order Matters', value: updates.order_matter ? 'Yes' : 'No', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'toggle-reactions') {
    const enabled = interaction.options.getBoolean('enabled');
    await toggleChannel(interaction.channelId, enabled);
    await interaction.reply({ content: `Auto reactions are now **${enabled ? 'enabled' : 'disabled'}** for this channel.`, ephemeral: true });
  }

  if (interaction.commandName === 'status-reactions') {
    const config = await getChannelConfig(interaction.channelId);
    if (!config) {
      return interaction.reply({ content: 'No configuration found for this channel. Use `/setup-reactions` first.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Auto Reaction Status')
      .setColor(config.enabled ? '#2ecc71' : '#e74c3c')
      .setDescription(`Settings for <#${interaction.channelId}>`)
      .addFields(
        { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
        { name: 'Role Required', value: config.role_id ? `<@&${config.role_id}>` : 'None', inline: true },
        { name: 'Media', value: config.media_emojis || 'Not set', inline: false },
        { name: 'Link', value: config.link_emojis || 'Not set', inline: false },
        { name: 'Text', value: config.text_emojis || 'Not set', inline: false }
      );
    await interaction.reply({ embeds: [embed] });
  }
});

// Content Type detection
const isUrl = (str) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!urlPattern.test(str);
};

// Message Reaction Handler
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    const config = await getChannelConfig(message.channelId);
    if (!config || !config.enabled) return;

    // Check Role
    if (config.role_id) {
        if (!message.member || !message.member.roles.cache.has(config.role_id)) {
            return;
        }
    }

    let emojiString = null;

    // Determine Content Type
    if (message.attachments.size > 0) {
        emojiString = config.media_emojis;
    } else if (message.content.split(/\s+/).some(word => isUrl(word))) {
        emojiString = config.link_emojis;
    } else {
        emojiString = config.text_emojis;
    }

    if (!emojiString) return;

    const emojis = parseEmojis(emojiString);
    if (!emojis || emojis.length === 0) return;

    // React in order or parallel
    try {
        if (config.order_matter) {
            for (const emoji of emojis) {
                // Try catch for each emoji in case it's invalid
                try {
                    await message.react(emoji.trim());
                } catch (e) {
                    console.error(`Failed to react with ${emoji}: `, e.message);
                }
            }
        } else {
            // Parallel (order not guaranteed)
            emojis.forEach(emoji => {
                message.react(emoji.trim()).catch(e => console.error(`Failed to react with ${emoji}:`, e.message));
            });
        }
    } catch (e) {
        console.error('Error in reaction logic: ', e);
    }
});

if (require.main === module) {
    client.login(process.env.TOKEN);
}

module.exports = client;
