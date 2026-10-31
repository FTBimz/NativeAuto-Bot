const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Cari dan putar video di YouTube')
        .addStringOption(option => 
            option.setName('pencarian')
                .setDescription('Judul video yang dicari')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const pencarian = interaction.options.getString('pencarian');
        
        try {
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(pencarian)}`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // Ekstrak ID video pertama dari hasil pencarian
            const videoIdMatch = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);

            if (videoIdMatch && videoIdMatch[1]) {
                const videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
                await interaction.editReply({ content: videoUrl });
            } else {
                await interaction.editReply({ content: searchUrl });
            }
        } catch (error) {
            console.error('YouTube Search Error:', error);
            const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(pencarian)}`;
            await interaction.editReply({ content: fallbackUrl });
        }
    }
};