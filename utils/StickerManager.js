const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

class StickerManager {
  static async createSticker(msg, client) {
    const media = await msg.downloadMedia();

    if (media instanceof MessageMedia && media.mimetype.includes('image/jpeg')) {
      const imageBuffer = Buffer.from(media.data, 'base64');
      const directoryPath = 'images';
      const filename = `${directoryPath}/sticker.jpeg`;

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }

      fs.writeFileSync(filename, imageBuffer);

      const parameters = msg.body.substring('!sticker/'.length).split('/');

      if (parameters.length === 2) {
        const [stickerAuthor, stickerNames] = parameters;

        const sticker = MessageMedia.fromFilePath(filename);

        if (sticker) {
          client.sendMessage(msg.from, sticker, {
            sendMediaAsSticker: true,
            stickerAuthor: stickerAuthor,
            stickerName: stickerNames,
          });
        } else {
          client.sendMessage(msg.from, 'Failed to create a sticker from the media.');
        }
      } else {
        client.sendMessage(msg.from, 'Invalid sticker parameters. Usage: !sticker/author/names');
      }
    }
  }
}

module.exports = StickerManager;
