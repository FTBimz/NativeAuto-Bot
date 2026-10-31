const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Tentang NativeAuto Bot'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Tentang Bot')
            .setColor(config.embedColor)
            .setDescription(config.aboutText)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
};