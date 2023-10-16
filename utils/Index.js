const TodoManager = require('./TodoManager');
const MenuManager = require('./MenuManager');
const MakananManager = require('./MakananManager');
const StickerManager = require('./StickerManager');
const WhatsAppBot = require('./WhatsAppBot');

class UtilityManager {
  constructor(client, db) {
    this.todoManager = new TodoManager(client, db);
    this.menuManager = new MenuManager(client);
    this.makananManager = new MakananManager(client);
    this.stickerManager = new StickerManager(client);
    this.whatsAppBot = new WhatsAppBot(client, this.menuManager, this.todoManager, this.makananManager, this.stickerManager);
  }

  initialize() {
    this.whatsAppBot.initialize();
  }

  displayQR() {
    this.whatsAppBot.handleQRCode();
  }
}

module.exports = UtilityManager;