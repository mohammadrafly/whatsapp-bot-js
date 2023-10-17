const { removeBackgroundFromImageFile } = require("remove.bg");
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
require('dotenv').config();
const sharp = require('sharp'); // You need to install the 'sharp' package using npm or yarn

class BackgroundRemover {
    constructor(client) {
        this.client = client;
    }

    async removeBackground(message) {
        try {
            const media = await message.downloadMedia();
            const imageBuffer = Buffer.from(media.data, 'base64');

            const directoryPath = 'images';
            const inputFilename = `${directoryPath}/input.png`;
            const outputFilename = `${directoryPath}/output.png`;

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }

            fs.writeFileSync(inputFilename, imageBuffer);

            await removeBackgroundFromImageFile({
                path: inputFilename,
                apiKey: process.env.BACKGROUND_REMOVER_API_KEY,
                size: "auto",
                type: "auto",
                scale: "original",
                outputFile: outputFilename,
            });
            
            await sharp(outputFilename)
                .sharpen()
                .resize({ width: 3840, height: 2160, fit: 'inside' })
                .toFile(`${directoryPath}/4k-image.png`);

            const Media = MessageMedia.fromFilePath(`${directoryPath}/4k-image.png`);
            if (Media) {
                this.client.sendMessage(message.from, Media, { sendMediaAsDocument: true });
            } else {
                this.client.sendMessage(message.from, 'Failed to remove the background and upscale the image to 4K.');
            }
        } catch (error) {
            this.client.sendMessage(message.from, 'Failed to remove the background and upscale the image to 4K.');
        }
    }
}

module.exports = BackgroundRemover;