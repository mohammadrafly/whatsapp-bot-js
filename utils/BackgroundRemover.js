const { removeBackgroundFromImageFile } = require("remove.bg");
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
require('dotenv').config();

class BackgroundRemover {
    constructor(client) {
        this.client = client;
    }

    async removeBackground(message) {
        try {
            const media = await message.downloadMedia();
            const imageBuffer = Buffer.from(media.data, 'base64');

            const directoryPath = 'images';
            const filename = `${directoryPath}/bg-remove.png`;

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }

            fs.writeFileSync(filename, imageBuffer);

            await removeBackgroundFromImageFile({
                path: filename,
                apiKey: process.env.BACKGROUND_REMOVER_API_KEY,
                size: "regular",
                type: "auto",
                scale: "100%",
                outputFile: filename,
            });

            const Media = MessageMedia.fromFilePath(filename);
            if (Media) {
                this.client.sendMessage(message.from, Media, { sendMediaAsDocument: true });
            } else {
                this.client.sendMessage(message.from, 'Failed to remove the background.')
            }
        } catch (error) {
            if (error.response && error.response.errors && error.response.errors.length > 0) {
                const errorInfo = error.response.errors[0];
                if (errorInfo.code === 'insufficient_credits') {
                    this.client.sendMessage(message.from, 'Failed to remove the background: Insufficient credits');
                } else {
                    this.client.sendMessage(message.from, 'Failed to remove the background.');
                }
            } else {
                this.client.sendMessage(message.from, 'Failed to remove the background.');
            }
        }
    }
}

module.exports = BackgroundRemover;