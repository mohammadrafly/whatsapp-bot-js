const qrcode = require('qrcode-terminal');

class WhatsAppBot {
    constructor(client, menuManager, todoManager, MakananManager, StickerManager) {
      this.client = client;
      this.menuManager = menuManager;
      this.todoManager = todoManager;
      this.MakananManager = MakananManager;
      this.StickerManager = StickerManager;
  
      this.client.on('qr', this.handleQRCode.bind(this));
      this.client.on('message', this.handleMessage.bind(this));
      this.client.on('ready', this.handleReady.bind(this));
    }
  
    initialize() {
      this.client.initialize();
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
  
      if (this.isInvalidUserNumber(userNumber)) {
        return;
      }
  
      const body = msg.body.toLowerCase();
      console.log(userNumber);
  
      if (body === '!menu') {
        this.menuManager.Menu(msg);
      } else if (body.startsWith('!list')) {
        this.todoManager.listTodos(msg);
      } else if (body.startsWith('!add/')) {
        this.todoManager.addTodoWithReminder(msg);
      } else if (body.startsWith('!airdrop')) {
        this.MakananManager.sendRandomMeal(this.client, userNumber);
      } else if (msg.hasMedia && body.startsWith('!sticker/')) {
        this.StickerManager.createSticker(msg, this.client);
      }
  
      if (userNumber === '628980659056@c.us' && body === 'mas') {
        this.client.sendMessage(userNumber, 'dhalem dek');
      }
    }
  
    async handleReady() {
      console.log('\nClient is now ready.');
    }

    isInvalidUserNumber(userNumber) {
      return userNumber && userNumber.match(/^628\d{10}-\d+@g\.us$/);
    }
  }
  
  module.exports = WhatsAppBot;