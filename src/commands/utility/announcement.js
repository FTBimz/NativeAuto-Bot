const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 300, // 5 menit
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Kirim pengumuman ke channel tertentu')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel tujuan pengumuman')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true))
        .addStringOption(option => 
            option.setName('pesan')
                .setDescription('Isi pesan pengumuman Anda')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('mention_role')
                .setDescription('Role yang akan diping (opsional, termasuk @everyone)'))
        .addAttachmentOption(option => option.setName('attachment_1').setDescription('File 1 (Gambar/Video)'))
        .addAttachmentOption(option => option.setName('attachment_2').setDescription('File 2 (Gambar/Video)'))
        .addAttachmentOption(option => option.setName('attachment_3').setDescription('File 3 (Gambar/Video)'))
        .addAttachmentOption(option => option.setName('attachment_4').setDescription('File 4 (Gambar/Video)'))
        .addAttachmentOption(option => option.setName('attachment_5').setDescription('File 5 (Gambar/Video)')),

    async execute(interaction) {
        // 1. PANGGIL deferReply() DI BARIS PERTAMA (Mencegah timeout 3 detik API Discord)
        await interaction.deferReply({ ephemeral: true });

        // 2. Pengecekan Izin Administrator
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const denyEmbed = new EmbedBuilder()
                .setColor(config.errorColor)
                .setDescription(`${config.emojis.error} Akses Ditolak! Perintah ini khusus Administrator.`);
            return interaction.editReply({ embeds: [denyEmbed] });
        }

        const channel = interaction.options.getChannel('channel');
        const pesan = interaction.options.getString('pesan');
        const role = interaction.options.getRole('mention_role');
        
        // 3. Kumpulkan semua file lampiran
        const files = [];
        for (let i = 1; i <= 5; i++) {
            const attachment = interaction.options.getAttachment(`attachment_${i}`);
            if (attachment) files.push(attachment.url);
        }

        // 4. Penanganan khusus tag @everyone vs Role biasa
        let pingText = '';
        if (role) {
            // Jika role yang dipilih adalah @everyone (ID role sama dengan ID server)
            if (role.id === interaction.guild.id || role.name === '@everyone') {
                pingText = '@everyone';
            } else {
                pingText = `${role}`;
            }
        }

        // Susun teks pengumuman murni (Tag + Pesan)
        const finalContent = pingText ? `${pingText}\n\n${pesan}` : pesan;

        try {
            // 5. Kirim pengumuman sebagai teks biasa + lampiran media
            await channel.send({
                content: finalContent,
                files: files,
                allowedMentions: { 
                    parse: ['everyone', 'roles', 'users'] 
                }
            });

            // 6. Konfirmasi sukses ke Admin (Embed Hijau)
            const successEmbed = new EmbedBuilder()
                .setColor(config.successColor)
                .setDescription(`${config.emojis.success} Pengumuman berhasil dikirim ke ${channel}!`);

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Announcement Error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.errorColor)
                .setDescription(`${config.emojis.error} Gagal mengirim pengumuman. Pastikan bot memiliki izin mengirim pesan dan melampirkan file di channel ${channel}.`);

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};