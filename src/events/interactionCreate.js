const { 
    Collection, 
    EmbedBuilder, 
    MessageFlags, 
    ChannelType, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // ==========================================
        // 1. PENANGANAN KLIK TOMBOL (BUTTON INTERACTION)
        // ==========================================
        if (interaction.isButton()) {
            
            // TOMBOL: Buka Tiket
            if (interaction.customId === 'open_ticket') {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const ticketChannelName = `ticket-${interaction.user.username.toLowerCase()}`;
                
                // Cek apakah user sudah memiliki channel tiket yang terbuka
                const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketChannelName);
                if (existingChannel) {
                    return interaction.editReply({ 
                        content: `${config.emojis.error} Anda sudah memiliki tiket yang aktif di ${existingChannel}!` 
                    });
                }

                try {
                    // 1. DETEKSI KATEGORI TEMPAT TOMBOL OPEN TICKET BERADA
                    let categoryId = interaction.channel.parentId;

                    // Jika channel panel tiket tidak berada di dalam kategori, buat/cari kategori bawaan
                    if (!categoryId) {
                        let category = interaction.guild.channels.cache.find(
                            c => c.type === ChannelType.GuildCategory && 
                            (c.name.toUpperCase().includes('TIKET') || c.name.toUpperCase().includes('TICKET'))
                        );

                        if (!category) {
                            category = await interaction.guild.channels.create({
                                name: '🎫 TIKET',
                                type: ChannelType.GuildCategory,
                            });
                        }
                        categoryId = category.id;
                    }

                    // 2. BUAT CHANNEL TIKET DI DALAM KATEGORI YANG SAMA
                    const ticketChannel = await interaction.guild.channels.create({
                        name: ticketChannelName,
                        type: ChannelType.GuildText,
                        parent: categoryId, // <-- Otomatis berada di bawah kategori tempat tombol dipasang
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id, // Sembunyikan dari semua member biasa
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: interaction.user.id, // Beri akses ke pembuat tiket
                                allow: [
                                    PermissionFlagsBits.ViewChannel, 
                                    PermissionFlagsBits.SendMessages, 
                                    PermissionFlagsBits.AttachFiles,
                                    PermissionFlagsBits.ReadMessageHistory
                                ],
                            },
                            {
                                id: client.user.id, // Beri akses ke Bot
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                            }
                        ],
                    });

                    // Embed Sambutan di dalam Channel Tiket Baru
                    const welcomeTicketEmbed = new EmbedBuilder()
                        .setTitle(`🎫 Tiket Dukungan - ${interaction.user.tag}`)
                        .setDescription('Halo! Selamat datang di tiket bantuan Anda.\nSilakan jelaskan masalah atau pertanyaan Anda di sini. Tim staff akan segera membalas.')
                        .setColor(config.embedColor)
                        .setTimestamp();

                    const ticketButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Tutup Tiket')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('delete_ticket')
                            .setLabel('Hapus Tiket')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ 
                        content: `<@${interaction.user.id}>`, 
                        embeds: [welcomeTicketEmbed], 
                        components: [ticketButtons] 
                    });

                    return interaction.editReply({ 
                        content: `${config.emojis.success} Tiket Anda berhasil dibuat: ${ticketChannel}` 
                    });

                } catch (err) {
                    console.error('Error saat membuat channel tiket:', err);
                    return interaction.editReply({ 
                        content: `${config.emojis.error} Gagal membuat channel tiket. Pastikan bot memiliki izin **Manage Channels**.` 
                    });
                }
            }

            // TOMBOL: Tutup Tiket
            if (interaction.customId === 'close_ticket') {
                await interaction.deferReply();
                
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
                    SendMessages: false
                });

                const closeEmbed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription('🔒 **Tiket ini telah ditutup.** Gunakan tombol hapus di bawah untuk menghapus channel ini.');

                return interaction.editReply({ embeds: [closeEmbed] });
            }

            // TOMBOL: Hapus Tiket
            if (interaction.customId === 'delete_ticket') {
                await interaction.reply({ content: '🗑️ Channel tiket ini akan dihapus dalam 5 detik...' });
                setTimeout(() => {
                    interaction.channel.delete().catch(() => {});
                }, 5000);
                return;
            }

            return;
        }

        // ==========================================
        // 2. PENANGANAN MODAL SUBMIT
        // ==========================================
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('announce_modal_')) {
                try {
                    const data = interaction.customId.split('_');
                    const channelId = data[2];
                    const roleId = data[3];

                    const channel = await client.channels.fetch(channelId);
                    const title = interaction.fields.getTextInputValue('announce_title') || 'Pengumuman Server';
                    const content = interaction.fields.getTextInputValue('announce_content');
                    
                    const files = client.tempFiles?.get(interaction.user.id) || [];
                    client.tempFiles?.delete(interaction.user.id);

                    const announceEmbed = new EmbedBuilder()
                        .setTitle(`${config.emojis.announcement} ${title}`)
                        .setDescription(content)
                        .setColor(config.embedColor)
                        .setFooter({ text: `Dikirim oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp();

                    if (files.length > 0) announceEmbed.setImage(files[0]);

                    let pingContent = '';
                    if (roleId !== 'none') pingContent = `<@&${roleId}>`;

                    await channel.send({
                        content: pingContent || null,
                        embeds: [announceEmbed],
                        files: files,
                        allowedMentions: { parse: ['roles', 'everyone'] }
                    });

                    const successEmbed = new EmbedBuilder()
                        .setColor(config.successColor)
                        .setDescription(`${config.emojis.success} Pengumuman berhasil dikirim ke ${channel}!`);

                    return await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
                } catch (error) {
                    console.error('Error pada modal:', error);
                    return;
                }
            }
            return;
        }

        // ==========================================
        // 3. PENANGANAN SLASH COMMAND
        // ==========================================
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                const cooldownEmbed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(`${config.emojis.error} Harap tunggu! Anda dapat menggunakan perintah ini lagi pada <t:${expiredTimestamp}:R>.`);
                return interaction.reply({ embeds: [cooldownEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Error saat menjalankan /${interaction.commandName}:`, error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(config.errorColor)
                .setDescription(`${config.emojis.error} Terjadi kesalahan saat menjalankan perintah me ini.`);
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }
            } catch (fallbackError) {
                console.error('Gagal mengirimkan pesan error.');
            }
        }
    },
};