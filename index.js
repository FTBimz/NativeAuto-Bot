const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const { loadEvents } = require('./src/handlers/eventHandler');
const { loadCommands } = require('./src/handlers/commandHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

(async () => {
    await loadEvents(client);
    await loadCommands(client);
    await client.login(process.env.DISCORD_TOKEN);
})();