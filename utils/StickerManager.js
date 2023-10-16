const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

class StickerManager {
  constructor(client) {
    this.client = client;
  }

  async createSticker(message) {
    const media = await message.downloadMedia();

    if (media instanceof MessageMedia && media.mimetype.includes('image/jpeg')) {
      const imageBuffer = Buffer.from(media.data, 'base64');
      const directoryPath = 'images';
      const filename = `${directoryPath}/sticker.jpeg`;

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }

      fs.writeFileSync(filename, imageBuffer);

      const author = 'BOT';
      const stickerName = 'Default Sticker Name';

      const sticker = MessageMedia.fromFilePath(filename);

      if (sticker) {
        this.client.sendMessage(message.from, sticker, {
          sendMediaAsSticker: true,
          stickerAuthor: author,
          stickerName: stickerName,
        });
      } else {
        this.client.sendMessage(message.from, 'Failed to create a sticker from the media.');
      }
    } else {
      this.client.sendMessage(message.from, 'Invalid media format. Please send a JPEG image.');
    }
  }
}

module.exports = StickerManager;
