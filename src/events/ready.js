const { ActivityType } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`Bot NativeAuto aktif sebagai ${client.user.tag}`);

        // Fungsi untuk mengambil format tanggal Indonesia (Contoh: "Sab, 31 Okt")
        const getFormattedDate = () => {
            const now = new Date();
            const options = { weekday: 'short', day: 'numeric', month: 'short' };
            let dateStr = now.toLocaleDateString('id-ID', options);
            return dateStr.replace(/\./g, '');
        };

        const updateStatus = () => {
            const currentDate = getFormattedDate();
            const statusText = `Arah mata Angin | ${currentDate}`;

            client.user.setPresence({
                activities: [{
                    name: statusText,
                    type: ActivityType.Streaming,
                    url: 'https://www.twitch.tv/discord'
                }],
                status: 'online',
            });
        };

        // Jalankan status pertama kali saat bot online
        updateStatus();

        // Diperbarui setiap 1 menit agar tanggal langsung berganti tepat saat melewati pukul 00:00 (tengah malam)
        setInterval(updateStatus, 60 * 1000);
    },
};