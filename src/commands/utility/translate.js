const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Terjemahkan teks secara langsung di Discord')
        .addStringOption(option => 
            option.setName('teks')
                .setDescription('Teks yang ingin diterjemahkan')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('ke_bahasa')
                .setDescription('Bahasa tujuan (Default: Indonesia)')
                .addChoices(
                    { name: 'Indonesia (ID)', value: 'id' },
                    { name: 'Inggris (EN)', value: 'en' },
                    { name: 'Jepang (JA)', value: 'ja' },
                    { name: 'Korea (KO)', value: 'ko' },
                    { name: 'Mandarin (ZH)', value: 'zh-CN' },
                    { name: 'Arab (AR)', value: 'ar' },
                    { name: 'Prancis (FR)', value: 'fr' },
                    { name: 'Jerman (DE)', value: 'de' },
                    { name: 'Spanyol (ES)', value: 'es' },
                    { name: 'Rusia (RU)', value: 'ru' },
                    { name: 'Italia (IT)', value: 'it' },
                    { name: 'Portugis (PT)', value: 'pt' },
                    { name: 'Belanda (NL)', value: 'nl' },
                    { name: 'Turki (TR)', value: 'tr' },
                    { name: 'Vietnam (VI)', value: 'vi' },
                    { name: 'Thailand (TH)', value: 'th' },
                    { name: 'Hindi (HI)', value: 'hi' },
                    { name: 'Filipina (TL)', value: 'tl' },
                    { name: 'Melayu (MS)', value: 'ms' },
                    { name: 'Polandia (PL)', value: 'pl' },
                    { name: 'Swedia (SV)', value: 'sv' },
                    { name: 'Yunani (EL)', value: 'el' },
                    { name: 'Ukraina (UK)', value: 'uk' },
                    { name: 'Rumania (RO)', value: 'ro' },
                    { name: 'Latin (LA)', value: 'la' }
                )),

    async execute(interaction) {
        await interaction.deferReply();
        const teks = interaction.options.getString('teks');
        const targetLang = interaction.options.getString('ke_bahasa') || 'id';

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(teks)}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            
            const translatedText = response.data[0].map(item => item[0]).join('');
            const detectedLang = (response.data[2] || 'AUTO').toUpperCase();
            const destinationLang = targetLang.toUpperCase();

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('🌐 Google Translate')
                .addFields(
                    { name: `${detectedLang}:`, value: teks },
                    { name: `${destinationLang}:`, value: translatedText }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            try {
                const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(teks)}&langpair=autodetect|${targetLang}`;
                const fbRes = await axios.get(fallbackUrl);
                const translatedText = fbRes.data.responseData.translatedText;

                const embed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle('🌐 Google Translate')
                    .addFields(
                        { name: 'AUTO:', value: teks },
                        { name: `${targetLang.toUpperCase()}:`, value: translatedText }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (fallbackErr) {
                const errEmbed = new EmbedBuilder()
                    .setColor(config.errorColor)
                    .setDescription(`${config.emojis.error} Server penerjemah sedang sibuk. Silakan coba lagi nanti.`);
                await interaction.editReply({ embeds: [errEmbed] });
            }
        }
    }
};