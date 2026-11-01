const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('maps')
        .setDescription('Cari lokasi di Google Maps')
        .addStringOption(option => 
            option.setName('lokasi')
                .setDescription('Alamat atau nama tempat')
                .setRequired(true)),
    async execute(interaction) {
        const lokasi = interaction.options.getString('lokasi');
        const encodedLokasi = encodeURIComponent(lokasi);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLokasi}`;

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('<:google_maps:1566296705144590396> Pencarian Google Maps')
            .setDescription(`Lokasi yang dicari: **${lokasi}**\n[Buka di Google Maps](${mapsUrl})`);
        
        await interaction.reply({ embeds: [embed] });
    }
};