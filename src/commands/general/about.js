const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Menampilkan informasi lengkap mengenai tentang bot NativeAuto'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            // Judul Kecil (Author)
            .setAuthor({ 
                name: 'NativeAuto', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            // Judul Utama
            .setTitle('About')
            // Deskripsi Konten Utama
            .setDescription(
                `**NativeAuto - v1.7.2**\n` +
                `NativeAuto adalah bot Discord serbaguna berbasis Indonesia yang dirancang untuk membantu pengelolaan server, utilitas, sistem tiket, dan otomatisasi media.\n\n` +

                `**Sosial Media:**\n` +
                `<:youtube:1566296149592113222> [PremierPro](https://www.youtube.com/@XPremierPro)\n` +
                `<:instagram:1566296145490092082> [@bimamauluta](https://www.instagram.com/bimamauluta?igsh=MW4yYnpyMTlhNnNjbw==)\n` +
                `<:tiktok:1566296147679518730> [@premier_pro](https://www.tiktok.com/@premier_pro?_r=1&_t=ZS-97wXQhPNoRt)\n` +
                `<a:discord_animated:1566331794192601150> Dukungan: [Fusion Pro](https://discord.gg/AwYnSzUE9P)\n\n` +

                `**Dukung kami:**\n` +
                `<:sociabuzz:1566333845270171778> [SociaBuzz](https://sociabuzz.com/bimame/tribe)\n` +
                `<:saweria:1566334903270907944> [Saweria](https://saweria.co/bimame)\n` +
                `<:paypal:1566335297233494036> [PayPal](https://www.paypal.com/paypalme/bimamauluta)\n\n` +

                `**Source:**\n` +
                `<:github:1566296143212838952> [GitHub Repository](https://github.com/FTBimz/NativeAuto-Bot)\n\n` +

                `[Terms of Service](https://drive.google.com/file/d/1KsddlSnrmDW6sbIqoKChEWobLuoxZCC8/view?usp=drive_link) | [Privacy Policy](https://drive.google.com/file/d/1pUAHpJGQqQ6HwHjJecVg93T6e1st8s0-/view?usp=drive_link)`
            )
            // Footer Pesan
            .setFooter({ 
                text: 'Dibuat pada 26 Okt 2026 | Berbasis Node.js diatas Javascript diciptakan dari Indonesia 🇮🇩' 
            });

        await interaction.reply({ embeds: [embed] });
    }
};