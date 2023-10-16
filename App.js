const UtilityManager = require('./utils/Index');
const firebase = require('./config/firebase');
const { Client, LocalAuth } = require('whatsapp-web.js');
const db = firebase.db;

const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath: 'C:/bin/ffmpeg.exe',
});

const utilityManager = new UtilityManager(client, db);
utilityManager.initialize();