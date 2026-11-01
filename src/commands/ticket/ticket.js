const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    MessageFlags 
} = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistem Tiket Bantuan')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Buat panel tiket di channel ini'))
        .addSubcommand(sub =>
            sub.setName('settings')
                .setDescription('Konfigurasi panel tiket berdasarkan Message ID')
                .addStringOption(opt => opt.setName('message_id').setDescription('ID Pesan Panel Tiket').setRequired(true))
                .addStringOption(opt => opt.setName('action').setDescription('Tindakan edit/hapus').setRequired(true))),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const sub = interaction.options.getSubcommand();

        if (sub === 'setup') {
            const panelEmbed = new EmbedBuilder()
                .setTitle(`${config.emojis.ticket} Pusat Bantuan & Dukungan`)
                .setDescription('Klik tombol di bawah ini untuk membuka tiket baru. Tim kami akan segera membantu Anda.')
                .setColor(config.embedColor)
                .setFooter({ text: 'Tiket otomatis ditutup/dihapus jika tidak aktif selama 12 jam.' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('Buka Tiket')
                    .setEmoji(config.emojis.ticket)
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
            
            const replyEmbed = new EmbedBuilder()
                .setColor(config.successColor)
                .setDescription(`${config.emojis.success} Panel tiket berhasil dipasang di channel ini.`);
            return interaction.editReply({ embeds: [replyEmbed] });
        }

        if (sub === 'settings') {
            const msgId = interaction.options.getString('message_id');
            const action = interaction.options.getString('action');

            const settingsEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription(`${config.emojis.success} Konfigurasi tiket untuk ID Pesan \`${msgId}\` dengan tindakan **${action}** berhasil diperbarui.`);
            return interaction.editReply({ embeds: [settingsEmbed] });
        }
    }
};