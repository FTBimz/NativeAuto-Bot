[nativeauto_readme.md](https://github.com/user-attachments/files/34809536/nativeauto_readme.md)
# NativeAuto Discord Bot

NativeAuto is a multi-purpose Discord bot built with Node.js and Discord.js v14, designed for utility, automation, and comprehensive server management.

## Features

* Moderation and Management: Essential server moderation tools and administrative utilities.
* Translation: Real-time translation supporting over 25+ major world languages with automatic source detection.
* Search and Media: Automated YouTube video search and retrieval with embedded player support.
* Calculator: Advanced mathematical expression evaluator with symbol normalization.
* Announcement: Advanced broadcast tool supporting multi-attachments and role mentions.
* Ticket System: Private support ticket creation with automated category grouping and staff controls.
* Custom Streaming Status: Dynamic status display featuring real-time date formatting updates.

## Project Structure

```
NativeAuto/
├── data/
├── src/
│   ├── commands/
│   ├── events/
│   └── handlers/
├── .env
├── config.json
├── deploy-commands.js
├── index.js
├── package-lock.json
└── package.json
```

## Prerequisites

* Node.js version 18.0.0 or higher
* npm (Node Package Manager)

## Installation and Setup

1. Clone the repository:

   ```
   git clone https://github.com/FTBimz/NativeAuto-Bot.git
   cd NativeAuto-Bot
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a .env file and configure your credentials:

   ```
   TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

4. Deploy slash commands:

   ```
   node deploy-commands.js
   ```

5. Start the bot:

   ```
   node index.js
   ```

## License

This project is open-source and available under the MIT License.
