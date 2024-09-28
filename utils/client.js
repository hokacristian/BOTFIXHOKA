// utils/client.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const { sessionPath } = require('../config/config');
const qrcode = require('qrcode-terminal');
const { handleBotMention, handleStickerCreation, handleReadReceipt } = require('../controllers/messageController'); // Import handleReadReceipt
const { handleGroupKick } = require('../controllers/kickController');
let client;

// Function to initialize the WhatsApp client
const initializeClient = () => {
  if (!client) {
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionPath,
        clientId: 'client-one',
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('QR code received. Scan it using your WhatsApp app.');
    });

    client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
      // Event listener for new messages
      client.on('message', (msg) => handleIncomingMessage(msg, client));
    });

    client.on('message_ack', (msg, ack) => {
      if (ack === 3) {
        try {
          handleReadReceipt(msg); // Call handleReadReceipt here
        } catch (error) {
          console.error('Error handling read receipt:', error);
        }
      }
    });

    client.on('error', (error) => {
      console.error('Client encountered an error:', error);
    });

    client.initialize();
  }

  return client;
};

// Handle incoming messages
const handleIncomingMessage = async (msg, client) => {
  const chat = await msg.getChat();

  // Only trigger sticker creation when bot is mentioned and it's an image
  if (msg.hasMedia && msg.type === 'image' && msg.mentionedIds && msg.mentionedIds.includes(client.info.wid._serialized)) {
    await handleStickerCreation(msg, chat, client);
  } else if (msg.mentionedIds && msg.mentionedIds.includes(client.info.wid._serialized)) {
    await handleBotMention(msg, chat, client);
  } else if (chat.isGroup && msg.body.toLowerCase().startsWith('!kick')) {
    await handleGroupKick(msg, chat, client);
  }
};

module.exports = {
  initializeClient,
  getClient: () => client,
  isAuthenticated: () => client && client.info && client.info.wid && client.info.pushname,
};
