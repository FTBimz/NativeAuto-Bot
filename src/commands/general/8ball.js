const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Tanyakan sesuatu pada Magic 8-Ball')
        .addStringOption(opt => opt.setName('pertanyaan').setDescription('Pertanyaan Anda').setRequired(true)),
    async execute(interaction) {
        const answers = [
            'Ya, tentu saja.', 'Sangat mungkin.', 'Tanda-tanda menunjukkan ya.',
            'Coba tanya lagi nanti.', 'Tidak bisa diprediksi sekarang.',
            'Jangan berharap banyak.', 'Jawaban saya adalah tidak.', 'Sangat ragu.'
        ];
        const question = interaction.options.getString('pertanyaan');
        const reply = answers[Math.floor(Math.random() * answers.length)];

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: 'Pertanyaan:', value: question },
                { name: 'Jawaban:', value: reply }
            );
        await interaction.reply({ embeds: [embed] });
    }
};