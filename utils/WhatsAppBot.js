const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");
const { MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();

class WhatsAppBot {
    constructor(client, menuManager, todoManager, makananManager, stickerManager, removeBackground, compressImage) {
      this.client = client;
      this.menuManager = menuManager;
      this.todoManager = todoManager;
      this.makananManager = makananManager;
      this.stickerManager = stickerManager;
      this.removeBackground = removeBackground;
      this.compressImage = compressImage;
  
      this.client.on('qr', this.handleQRCode.bind(this));
      this.client.on('message', this.handleMessage.bind(this));
      this.client.on('ready', this.handleReady.bind(this));
    }
  
    initialize() {
      this.client.initialize();
    }
  
    async generateResponse(message) {
      const apiKey = process.env.OPENAI_API_KEY;
      const prompt = `User said: "${message}"`;
  
      const openai = new OpenAI({ apiKey });
  
      try {
        const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
        });
  
        return chatCompletion.choices[0].message.content;
      } catch (error) {
        console.error(error);
        return ''; 
      }
    }

    async handleQRCode() {
      if (this.client.isReady) {
        console.log('Client is already ready, no need to render QR code.');
        return;
      }
    
      let loadingInterval;
      let qrCodeGenerated = false;
    
      const qrCodePromise = new Promise((resolve, reject) => {
        this.client.once('qr', (qrCode) => {
          qrCodeGenerated = true;
          resolve(qrCode);
        });
    
        const timeout = 60000;
        const startTime = Date.now();
        const loadingBarWidth = 40;
    
        loadingInterval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const percentage = (elapsedTime / timeout) * 100;
          const progress = Math.round((loadingBarWidth * percentage) / 100);
          const loadingBar = '[' + '='.repeat(progress) + ' '.repeat(loadingBarWidth - progress) + ']';
          process.stdout.write(`\rLoading: ${loadingBar} ${percentage.toFixed(2)}%`);
    
          if (qrCodeGenerated) {
            clearInterval(loadingInterval);
          }
        }, 100);
    
        setTimeout(() => {
          clearInterval(loadingInterval);
          reject(new Error('QR code not received within the timeout.'));
        }, timeout);
      });
    
      try {
        const qrCodeData = await qrCodePromise;
        clearInterval(loadingInterval);
        console.log('\nQR code received.');
        qrcode.generate(qrCodeData, { small: true });
        return qrCodeData;
      } catch (error) {
        clearInterval(loadingInterval);
        console.error(error);
        throw error;
      }
    }    
    
    async handleMessage(msg) {
      const userNumber = msg.from;
  
      const body = msg.body.toLowerCase();
      console.log(userNumber);

      if (body.startsWith('!menu')) {
        this.menuManager.Menu(msg);
      /** Untuk sementara di matikan karna fokus pada image processing
      } else if (body.startsWith('!list')) {
        this.todoManager.listTodos(msg);
      } else if (body.startsWith('!add/')) {
        this.todoManager.addTodoWithReminder(msg);
      } else if (body.startsWith('!airdrop')) {
        this.makananManager.sendRandomMeal(msg);
      **/
      } else if (msg.hasMedia && body.startsWith('!sticker')) {
        try {
            const author = 'BOT';
            const stickerName = 'Default Sticker Name';
            const imagePath = await this.stickerManager.createSticker(msg);
            const Media = MessageMedia.fromFilePath(imagePath);
            if (Media) {
                msg.reply(Media, null, {
                    sendMediaAsSticker: true,
                    stickerAuthor: author,
                    stickerName: stickerName,
                });
            } else {
                msg.reply('Failed to create a sticker from the media.');
            }
        } catch (error) {
            console.error('Error creating sticker:', error);
            msg.reply('Failed to create a sticker from the media.');
        }
      } else if (msg.hasMedia && body.startsWith('!remove-bg')) {
        try {
            const imagePath = await this.removeBackground.removeBackground(msg);
            const Media = MessageMedia.fromFilePath(imagePath);
            if (Media) {
                msg.reply(Media, null, {
                    sendMediaAsDocument: true,
                    caption: `Here's the result!`
                });
            } else {
                msg.reply('Failed to remove the background and upscale the image to 4K.');
            }
        } catch (error) {
            console.error('Error removing the background:', error);
            msg.reply('Failed to remove the background and upscale the image to 4K.');
        }
      } else if (msg.hasMedia && body.startsWith('!compress')) {
        try {
            const imagePath = await this.compressImage.compress(msg);
            const Media = MessageMedia.fromFilePath(imagePath);
            if (Media) {
                msg.reply(Media, null, {
                    sendMediaAsDocument: true,
                    caption: `Here's the result!`
                });
            } else {
                msg.reply('Failed to compress.');
            }
        } catch (error) {
            console.error('Error compressing:', error);
            msg.reply('Failed to compress.');
        }
      } else {
        // Handle other cases
      }
  
      /** 
      if (userNumber === '628980659056@c.us' || userNumber === '6281907861308@c.us') {
        this.generateResponse(body)
          .then((response) => {
            this.client.sendMessage(userNumber, response);
          })
          .catch((error) => {
            console.error(error);
            this.client.sendMessage(userNumber, `Opps.. theres something wrong with me.`)
          });
      }   
      **/   
    }
  
    async handleReady() {
      console.log(`\n
      _______  ___      ___   _______  __    _  _______    ______    _______  _______  ______   __   __ 
      |       ||   |    |   | |       ||  |  | ||       |  |    _ |  |       ||   _   ||      | |  | |  |
      |       ||   |    |   | |    ___||   |_| ||_     _|  |   | ||  |    ___||  |_|  ||  _    ||  |_|  |
      |       ||   |    |   | |   |___ |       |  |   |    |   |_||_ |   |___ |       || | |   ||       |
      |      _||   |___ |   | |    ___||  _    |  |   |    |    __  ||    ___||       || |_|   ||_     _|
      |     |_ |       ||   | |   |___ | | |   |  |   |    |   |  | ||   |___ |   _   ||       |  |   |  
      |_______||_______||___| |_______||_|  |__|  |___|    |___|  |_||_______||__| |__||______|   |___|  
      `);
    }
  }
  
  module.exports = WhatsAppBot;