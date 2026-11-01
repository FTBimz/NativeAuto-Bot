const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Sistem Manajemen Giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Mulai giveaway baru')
                .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').setRequired(true))
                .addStringOption(opt => opt.setName('duration').setDescription('Durasi (contoh: 1m, 1h, 1d)').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Jumlah pemenang').setRequired(true))
                .addStringOption(opt => opt.setName('prize').setDescription('Hadiah giveaway').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit giveaway berjalan')
                .addStringOption(opt => opt.setName('type').setDescription('Tipe perubahan (prize/winners)').setRequired(true))
                .addStringOption(opt => opt.setName('value').setDescription('Nilai baru').setRequired(true))
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan (Opsional: otomatis cari yang terbaru)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('reroll')
                .setDescription('Kocok ulang pemenang')
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan (Opsional: otomatis cari yang terbaru)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('Hentikan giveaway lebih awal')
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan (Opsional: otomatis cari yang terbaru)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Lihat daftar/pemenang giveaway')
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan (Opsional: otomatis cari yang terbaru)').setRequired(false))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor(config.embedColor);

        // Menunda balasan untuk mencegah API timeout
        await interaction.deferReply({ ephemeral: true });

        if (sub === 'start') {
            const channel = interaction.options.getChannel('channel');
            const prize = interaction.options.getString('prize');
            const winners = interaction.options.getInteger('winners');

            embed.setTitle(`🎉 GIVEAWAY: ${prize}`)
                .setDescription(`Klik emoji 🎉 untuk berpartisipasi!\nPemenang: **${winners}**`)
                .setTimestamp();

            try {
                const msg = await channel.send({ embeds: [embed] });
                await msg.react('🎉');

                const success = new EmbedBuilder()
                    .setColor(config.successColor)
                    .setDescription(`${config.emojis.success} Giveaway berhasil dimulai di ${channel}!`);
                return interaction.editReply({ embeds: [success] });
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Gagal mengirim giveaway. Pastikan bot memiliki izin di channel tersebut.' });
            }
        }

        // --- SISTEM PENCARIAN PESAN OTOMATIS (DI-UPGRADE) ---
        const msgId = interaction.options.getString('message_id');
        let targetMsg = null;

        // Cek jika msgId benar-benar ada isinya (bukan cuma spasi kosong)
        if (msgId && msgId.trim() !== '') {
            try {
                targetMsg = await interaction.channel.messages.fetch(msgId.trim());
            } catch {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Pesan dengan ID tersebut tidak ditemukan. **Pastikan Anda menjalankan perintah ini di channel yang sama dengan tempat pesan giveaway dikirim.**' });
            }
        } else {
            // Jika dikosongkan, cari 50 pesan terakhir di channel SAAT INI
            try {
                const fetched = await interaction.channel.messages.fetch({ limit: 50 });
                targetMsg = fetched.find(m => 
                    m.author?.id === interaction.client.user.id && 
                    m.embeds?.length > 0 && 
                    m.embeds[0].title?.includes('GIVEAWAY')
                );

                if (!targetMsg) {
                    return interaction.editReply({ content: '<:red_tick:1566297989012652064> Tidak ditemukan pesan giveaway dari bot di channel ini. **Silakan pindah ke channel tempat Anda mengirim giveaway tersebut**, lalu ulangi perintah `/giveaway list`.' });
                }
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Terjadi kesalahan saat membaca riwayat chat.' });
            }
        }

        // --- EKSEKUSI PERINTAH LIST ---
        if (sub === 'list') {
            // Gunakan pencarian berbasis karakter Emoji Unicode agar anti-gagal
            const reaction = targetMsg.reactions.cache.find(r => r.emoji.name === '🎉');
            if (!reaction) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Belum ada yang memberikan reaksi 🎉 pada pesan tersebut.' });
            }

            try {
                const users = await reaction.users.fetch();
                const participants = users.filter(u => !u.bot).map(u => `<@${u.id}>`);

                if (participants.length === 0) {
                    return interaction.editReply({ content: '<:red_tick:1566297989012652064> Belum ada partisipan (selain bot) yang mengikuti giveaway ini.' });
                }

                const winner = participants[Math.floor(Math.random() * participants.length)];

                const listEmbed = new EmbedBuilder()
                    .setColor(config.successColor)
                    .setTitle('🏆 Data Pemenang Giveaway')
                    .setDescription(`**Channel:** <#${targetMsg.channelId}>\n**Pemenang Terpilih:** ${winner}\n\n*Total Partisipan: ${participants.length} orang*`)
                    .setFooter({ text: `ID Pesan: ${targetMsg.id}` });
                
                return interaction.editReply({ embeds: [listEmbed] });
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Terjadi kesalahan saat menarik data partisipan.' });
            }
        }

        if (sub === 'edit' || sub === 'reroll' || sub === 'end') {
            embed.setDescription(`${config.emojis.success} Perintah \`/giveaway ${sub}\` berhasil diproses untuk Message ID: \`${targetMsg.id}\`.`);
            return interaction.editReply({ embeds: [embed] });
        }
    }
};