const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Memeriksa latensi jaringan bot'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription(`🏓 **Pong!**\nLatensi Bot: \`${Date.now() - interaction.createdTimestamp}ms\`\nLatensi API: \`${Math.round(client.ws.ping)}ms\``);
        await interaction.reply({ embeds: [embed] });
    }
};