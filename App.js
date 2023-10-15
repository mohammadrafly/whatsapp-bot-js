const { Client, LocalAuth } = require('whatsapp-web.js');
const firebase = require('./config/firebase');
const TodoManager = require('./utils/TodoManager');
const MenuManager = require('./utils/MenuManager');
const MakananManager = require('./utils/MakananManager');
const StickerManager = require('./utils/StickerManager');
const WhatsAppBot = require('./utils/WhatsAppBot');

const db = firebase.db;

const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath: 'C:/bin/ffmpeg.exe',
});

const todoManager = new TodoManager(client, db);
const menuManager = new MenuManager(client);

const bot = new WhatsAppBot(client, menuManager, todoManager, MakananManager, StickerManager);
bot.initialize();