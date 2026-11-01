const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('Cari sesuatu di Google')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Kata kunci pencarian')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const encodedQuery = encodeURIComponent(query);
        const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('<:google:1566296703160549416> Hasil Pencarian Google')
            .setDescription(`Berikut adalah hasil pencarian untuk **${query}**:\n[Klik di sini untuk melihat hasil](${searchUrl})`);
        
        await interaction.reply({ embeds: [embed] });
    }
};