const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");
require('dotenv').config();

class WhatsAppBot {
    constructor(client, menuManager, todoManager, makananManager, stickerManager, removeBackground) {
      this.client = client;
      this.menuManager = menuManager;
      this.todoManager = todoManager;
      this.makananManager = makananManager;
      this.stickerManager = stickerManager;
      this.removeBackground = removeBackground;
  
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

      if (body === '!menu') {
        this.menuManager.Menu(msg);
      } else if (body.startsWith('!list')) {
        this.todoManager.listTodos(msg);
      } else if (body.startsWith('!add/')) {
        this.todoManager.addTodoWithReminder(msg);
      } else if (body.startsWith('!airdrop')) {
        this.makananManager.sendRandomMeal(msg);
      } else if (msg.hasMedia && body.startsWith('!sticker')) {
        this.stickerManager.createSticker(msg);
      } else if (msg.hasMedia && body.startsWith('!remove-bg')) {
        this.removeBackground.removeBackground(msg)
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
      console.log('\nClient is now ready.');
    }
  }
  
  module.exports = WhatsAppBot;