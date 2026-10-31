const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Tampilkan informasi cuaca saat ini secara global')
        .addStringOption(option => 
            option.setName('kota')
                .setDescription('Nama kota/lokasi yang ingin dicek')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const kota = interaction.options.getString('kota');

        try {
            // Mengambil data cuaca real-time dalam format JSON dari wttr.in
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(kota)}?format=j1`);
            const data = response.data;

            const current = data.current_condition[0];
            const area = data.nearest_area[0];

            const locationName = `${area.areaName[0].value}, ${area.country[0].value}`;
            const condition = current.weatherDesc[0].value;
            const tempC = `${current.temp_C}°C`;
            const tempF = `${current.temp_F}°F`;
            const feelsC = `${current.FeelsLikeC}°C`;
            const feelsF = `${current.FeelsLikeF}°F`;
            const wind = `${current.windspeedMiles} mph ${current.winddir16Point}`;
            const humidity = `${current.humidity}%`;
            
            // Mengambil info Timezone jika ada
            const timezone = data.time_zone && data.time_zone[0] ? data.time_zone[0].zone : 'Local';

            // Menyusun tampilan Embed sesuai format gambar
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(`Weather for ${locationName}`)
                .setDescription(`**${condition}**`)
                .addFields(
                    { name: 'Timezone', value: timezone, inline: true },
                    { name: 'Degree Type', value: 'C / F', inline: true },
                    { name: 'Temperature', value: `${tempC} (${tempF})`, inline: true },
                    { name: 'Feels Like', value: `${feelsC} (${feelsF})`, inline: true },
                    { name: 'Winds', value: wind, inline: true },
                    { name: 'Humidity', value: humidity, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            const errEmbed = new EmbedBuilder()
                .setColor(config.errorColor)
                .setDescription(`${config.emojis.error} Kota **${kota}** tidak ditemukan atau terjadi gangguan saat mengambil data cuaca.`);
            await interaction.editReply({ embeds: [errEmbed] });
        }
    }
};