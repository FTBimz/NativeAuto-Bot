const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Kirim pesan biasa secara bebas')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('Pesan yang ingin dikirim')
                .setRequired(true)),

    async execute(interaction) {
        const messageText = interaction.options.getString('message');

        // Mencegah tag ping yang merugikan
        await interaction.channel.send({
            content: messageText,
            allowedMentions: { parse: [] } // Blokir semua ping (everyone, roles, users)
        });

        await interaction.reply({ content: '<:green_tick:1566297986735280240> Pesan terkirim!', ephemeral: true });
    }
};