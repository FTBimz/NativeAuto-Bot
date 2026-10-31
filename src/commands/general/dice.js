const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Lempar dadu')
        .addIntegerOption(opt => opt.setName('sides').setDescription('Jumlah sisi dadu (default: 6)')),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription(`🎲 Anda melempar dadu **D${sides}** dan mendapatkan angka **${result}**!`);
        await interaction.reply({ embeds: [embed] });
    }
};