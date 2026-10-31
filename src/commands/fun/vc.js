const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('Kontrol Voice Channel Bot')
        .addSubcommand(sub => 
            sub.setName('run')
                .setDescription('Bot akan masuk ke Voice Channel Anda'))
        .addSubcommand(sub => 
            sub.setName('leave')
                .setDescription('Bot akan keluar dari Voice Channel')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const memberVoice = interaction.member.voice.channel;

        if (subcommand === 'run') {
            if (!memberVoice) {
                const noVcEmbed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(`${config.emojis.error} Anda harus masuk ke Voice Channel terlebih dahulu!`);
                return interaction.reply({ embeds: [noVcEmbed], ephemeral: true });
            }

            joinVoiceChannel({
                channelId: memberVoice.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const joinEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription(`🔊 Berhasil masuk ke Voice Channel: **${memberVoice.name}**`);
            return interaction.reply({ embeds: [joinEmbed] });
        } 
        
        if (subcommand === 'leave') {
            const connection = getVoiceConnection(interaction.guild.id);
            if (!connection) {
                const notInVcEmbed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(`${config.emojis.error} Bot sedang tidak berada di Voice Channel mana pun.`);
                return interaction.reply({ embeds: [notInVcEmbed], ephemeral: true });
            }

            connection.destroy();
            const leaveEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription(`🔇 Berhasil keluar dari Voice Channel.`);
            return interaction.reply({ embeds: [leaveEmbed] });
        }
    }
};