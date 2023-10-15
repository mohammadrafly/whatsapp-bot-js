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
  
    handleQRCode(qr) {
      qrcode.generate(qr, { small: true });
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
  
    handleReady() {
      console.log('Client siap!');
    }
  
    isInvalidUserNumber(userNumber) {
      return userNumber && userNumber.match(/^628\d{10}-\d+@g\.us$/);
    }
  }
  
  module.exports = WhatsAppBot;