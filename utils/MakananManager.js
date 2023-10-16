const axios = require('axios');
const imageDownloader = require('./ImageDownloader');
const { MessageMedia } = require('whatsapp-web.js');
const iDownloader = new imageDownloader();

class MakananManager {
  constructor(client) {
    this.client = client;
  }

  async getMealInfo() {
    const mealResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
    const mealData = mealResponse.data.meals[0];

    if (mealData) {
      const mealName = mealData.strMeal;
      const mealInstructions = mealData.strInstructions;
      const mealThumbUrl = mealData.strMealThumb;
      return {
        mealName,
        mealInstructions,
        mealThumbUrl,
      };
    } else {
      return null;
    }
  }

  async sendRandomMeal(message) {
    const userNumber = message.from;
    const mealInfo = await this.getMealInfo();

    if (mealInfo) {
      const { mealName, mealInstructions, mealThumbUrl } = mealInfo;

      const directoryPath = 'images';
      const thumbFilename = `${directoryPath}/meal.jpg`;

      try {
        iDownloader.downloadImage(mealThumbUrl, thumbFilename)
            .then(() => {
                console.log('Image downloaded successfully.');
            })
            .catch((error) => {
                console.error('Error downloading image:', error);
            });

        const media = MessageMedia.fromFilePath(thumbFilename);
        const responseMessage = `Makanan Hari Ini: ${mealName}\nInstruksi: ${mealInstructions}`;
        
        this.client.sendMessage(userNumber, media, {
          caption: responseMessage
        });
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    } else {
      const errorMessage = 'Maaf, tidak dapat menemukan informasi makanan saat ini.';
      this.client.sendMessage(userNumber, errorMessage);
    }
  }
}

module.exports = MakananManager;
