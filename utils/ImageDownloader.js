const fs = require('fs');
const axios = require('axios');

class ImageDownloader {
  async downloadImage(url, destination) {
    const writer = fs.createWriteStream(destination);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}

module.exports = ImageDownloader;
