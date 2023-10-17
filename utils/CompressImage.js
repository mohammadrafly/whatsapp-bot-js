const sharp = require('sharp');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

class CompressImage {
    constructor(client) {
        this.client = client;
    }

    async compress(message) {
        try {
            const media = await message.downloadMedia();
            const directoryPath = 'images';

            if (media.mimetype.startsWith('image/')) {
                const imageBuffer = Buffer.from(media.data, 'base64');
                const inputFilename = `${directoryPath}/compress-input.${media.mimetype.split('/')[1]}`;
                const outputFilename = `${directoryPath}/compress-output.png`;

                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath);
                }

                fs.writeFileSync(inputFilename, imageBuffer);

                const image = sharp(inputFilename);

                if (media.mimetype.startsWith('image/jpeg')) {
                    image.jpeg({ quality: 50 });
                } else if (media.mimetype.startsWith('image/png')) {
                    image.png({ quality: 50 });
                } else if (media.mimetype.startsWith('image/webp')) {
                    image.webp({ quality: 50 });
                } else {
                    this.client.sendMessage(message.from, `Failed to compress. Unsupported image format: ${media.mimetype}`);
                }

                await image.toFile(outputFilename);

                const Media = MessageMedia.fromFilePath(outputFilename);
                if (Media) {
                    this.client.sendMessage(message.from, Media, { sendMediaAsDocument: true });
                } else {
                    this.client.sendMessage(message.from, 'Failed to compress.');
                }
            } else {
                this.client.sendMessage(message.from, 'Received a document. Currently, I only handle images.');
            }
        } catch (error) {
            console.error(`Error compressing media: ${error.message}`);
        }
    }
}

module.exports = CompressImage;
