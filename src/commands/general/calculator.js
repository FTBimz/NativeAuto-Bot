const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('Kalkulator matematika sederhana dan kompleks')
        .addStringOption(option => 
            option.setName('ekspresi')
                .setDescription('Contoh: 10 / 2, 10 : 2, 5 x 5, atau (2 + 3) * 4')
                .setRequired(true)),

    async execute(interaction) {
        const expr = interaction.options.getString('ekspresi');
        
        try {
            // Otomatis ubah simbol pembagian (: dan ÷) ke / serta perkalian (x dan ×) ke *
            let sanitizedExpr = expr
                .replace(/÷|:/g, '/')
                .replace(/×|x|X/g, '*')
                .replace(/,/g, '.');

            // Validasi karakter aman (hanya angka dan operator matematika)
            if (/[^0-9+\-*/%(). ]/.test(sanitizedExpr)) {
                throw new Error('Karakter tidak valid');
            }

            // Hitung hasil kalkulasi
            const result = Function(`'use strict'; return (${sanitizedExpr})`)();

            if (result === undefined || isNaN(result)) {
                throw new Error('Hasil tidak valid');
            }

            const embed = new EmbedBuilder()
                .setTitle('🔢 Kalkulator NativeAuto')
                .setColor(config.embedColor)
                .addFields(
                    { name: 'Soal:', value: `\`\`\`${expr}\`\`\`` },
                    { name: 'Hasil:', value: `\`\`\`${result}\`\`\`` }
                )
                .setFooter({ text: '💡 Tips: Bisa gunakan simbol + (tambah), - (kurang), * atau x (kali), / atau : (bagi).' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errEmbed = new EmbedBuilder()
                .setColor(config.errorColor)
                .setDescription(`${config.emojis.error} Ekspresi matematika tidak valid!`)
                .setFooter({ text: '💡 Tips: Gunakan format matematika yang benar (Contoh: 10 : 2 atau 10 / 2).' });

            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    }
};