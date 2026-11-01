const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan panduan semua slash commands NativeAuto'),
        
    async execute(interaction) {
        // Tunda balasan agar tidak terkena limit 3 detik
        await interaction.deferReply(); 

        const embed = new EmbedBuilder()
            .setTitle('<:blurple_slash_commands:1566316304745496746> Panduan Perintah NativeAuto Bot')
            .setColor(config.embedColor)
            .setDescription('Berikut adalah daftar perintah yang tersedia di server ini:')
            .addFields(
                { name: '<:announcement:1566302218955788341> Utilitas', value: '`/announcement` - Kirim pengumuman (Admin)\n`/send` - Kirim pesan bebas\n`/ticket setup` & `/ticket settings` - Tiket bantuan' },
                { name: '<:giveaway:1566314727301451796> Fun & Interaksi', value: '`/giveaway` - Sistem undian\n`/dice` - Lempar dadu\n`/8ball` - Tanya bola ajaib\n`/vc run` & `/vc leave` - Kontrol Voice' },
                { name: '<:google:1566296703160549416> Pencarian', value: '`/google` - Cari Google\n`/maps` - Cari alamat\n`/translate` - Terjemahan\n`/youtube` - Cari video\n`/weather` - Cek cuaca' },
                { name: '<a:yellow_gears:1566314619251851444> Sistem', value: '`/calculator` - Hitung matematika\n`/ping` - Cek jaringan\n`/about` - Info bot' }
            )
            .setFooter({ text: 'Gunakan / (slash) untuk melihat opsi.', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            
        // Gunakan editReply karena pesan sudah di-defer sebelumnya
        await interaction.editReply({ embeds: [embed] });
    }
};