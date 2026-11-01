const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

console.log('Mencari file perintah...');

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Terbaca: /${command.data.name}`);
        } else {
            console.log(`❌ Gagal memuat: ${file} (Format tidak sesuai)`);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`\nSedang meregister ${commands.length} slash commands secara GLOBAL...`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Pembaruan selesai! Slash commands berhasil diperbarui ke Discord.');
    } catch (error) {
        console.error('Gagal meregister command:', error);
    }
})();