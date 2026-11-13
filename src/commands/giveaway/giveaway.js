const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Sistem Manajemen Giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Mulai giveaway baru')
                .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').setRequired(true))
                .addStringOption(opt => opt.setName('duration').setDescription('Durasi (contoh: 1m, 1h, 1d)').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Jumlah pemenang').setMinValue(1).setMaxValue(10).setRequired(true))
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
                .setDescription('Lihat daftar pemenang giveaway (3 sampai 10 member)')
                .addIntegerOption(opt =>
                    opt.setName('jumlah')
                        .setDescription('Jumlah pemenang yang ditampilkan (Min: 3, Max: 10, Default: 10)')
                        .setMinValue(3)
                        .setMaxValue(10)
                        .setRequired(false)
                )
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan (Opsional: otomatis cari yang terbaru)').setRequired(false))),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: '❌ Perintah ini hanya dapat digunakan di dalam server.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor(config.embedColor);

        await interaction.deferReply({ ephemeral: true });

        if (sub === 'start') {
            const channel = interaction.options.getChannel('channel');
            const prize = interaction.options.getString('prize');
            const winners = interaction.options.getInteger('winners');

            if (channel.guildId !== interaction.guild.id) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Channel tujuan harus berada di server ini.' });
            }

            embed.setTitle(`🎉 GIVEAWAY: ${prize}`)
                .setDescription(`Klik emoji 🎉 untuk berpartisipasi!\nPemenang: **${winners}**`)
                .setFooter({ text: `Server: ${interaction.guild.name}` })
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

        // --- SISTEM PENCARIAN PESAN OTOMATIS (TERISOLASI PER SERVER) ---
        const msgId = interaction.options.getString('message_id');
        let targetMsg = null;

        if (msgId && msgId.trim() !== '') {
            try {
                targetMsg = await interaction.channel.messages.fetch(msgId.trim());
                if (targetMsg.guildId !== interaction.guild.id) {
                    return interaction.editReply({ content: '<:red_tick:1566297989012652064> Pesan tersebut berasal dari server lain.' });
                }
            } catch {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Pesan dengan ID tersebut tidak ditemukan. **Pastikan Anda menjalankan perintah ini di channel yang sama dengan tempat pesan giveaway dikirim.**' });
            }
        } else {
            try {
                const fetched = await interaction.channel.messages.fetch({ limit: 50 });
                targetMsg = fetched.find(m =>
                    m.guildId === interaction.guild.id &&
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

        // --- EKSEKUSI PERINTAH LIST (3 - 10 PEMENANG) ---
        if (sub === 'list') {
            const displayLimit = interaction.options.getInteger('jumlah') || 10;
            const reaction = targetMsg.reactions.cache.find(r => r.emoji.name === '🎉');

            if (!reaction) {
                return interaction.editReply({ content: '<:red_tick:1566297989012652064> Belum ada yang memberikan reaksi 🎉 pada pesan tersebut.' });
            }

            try {
                const users = await reaction.users.fetch();
                const participantIds = [...users.filter(u => !u.bot).keys()];

                if (participantIds.length === 0) {
                    return interaction.editReply({ content: '<:red_tick:1566297989012652064> Belum ada partisipan (selain bot) yang mengikuti giveaway ini.' });
                }

                // Acak urutan pemenang dari atas hingga bawah
                for (let i = participantIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [participantIds[i], participantIds[j]] = [participantIds[j], participantIds[i]];
                }

                const selectedWinners = participantIds.slice(0, displayLimit);
                const formattedWinners = selectedWinners
                    .map((id, index) => `**${index + 1}.** <@${id}>`)
                    .join('\n');

                const minNote = participantIds.length < 3
                    ? `\n⚠️ *Disarankan minimal 3 partisipan (saat ini baru ${participantIds.length} orang).*`
                    : '';

                const listEmbed = new EmbedBuilder()
                    .setColor(config.successColor)
                    .setTitle(`🏆 Daftar Pemenang Giveaway (Top ${selectedWinners.length})`)
                    .setDescription(
                        `**Server:** ${interaction.guild.name}\n` +
                        `**Channel:** <#${targetMsg.channelId}>\n` +
                        `**Batas Tampilan:** ${displayLimit} member\n\n` +
                        `**Urutan Pemenang (Atas ke Bawah):**\n${formattedWinners}\n\n` +
                        `*Total Partisipan: ${participantIds.length} orang*${minNote}`
                    )
                    .setFooter({ text: `ID Pesan: ${targetMsg.id}` })
                    .setTimestamp();

                return interaction.editReply({
                    embeds: [listEmbed],
                    allowedMentions: { parse: [] } // Mention tampil tanpa nge-tag / ping
                });
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