// controllers/messageController.js

// Function to handle read receipts
const handleReadReceipt = (msg) => {
    console.log('Message read:', msg.body);
  
    // Add logic here to handle when a message is read
    // For example, log it to a database or trigger another event
  };
  
  // Handle bot mention messages
  const handleBotMention = async (msg, chat, client) => {
    const authorizedNumber = '6285173052969@c.us'; // The number authorized to use the tag-all feature
  
    // Check if the message sender is the authorized number
    if (msg.author === authorizedNumber || msg.from === authorizedNumber) {
      if (chat.isGroup) {
        const participants = chat.participants;
        const mentionIds = participants.map((p) => p.id._serialized);
        const mentionsText = participants.map((p) => `@${p.id.user}`).join(' ');
  
        try {
          await chat.sendMessage(mentionsText, { mentions: mentionIds });
        } catch (error) {
          console.error('Error sending tag all message:', error);
        }
      }
    } else {
      console.log('Unauthorized user attempted to use the tag-all feature.');
    }
  };
  
  // Handle sticker creation only when bot is mentioned
  const handleStickerCreation = async (msg, chat, client) => {
    // Ensure that the bot is tagged in the message with an image
    if (msg.mentionedIds && msg.mentionedIds.includes(client.info.wid._serialized)) {
      if (msg.hasMedia && msg.type === 'image') {
        try {
          const media = await msg.downloadMedia();
          await chat.sendMessage(media, { sendMediaAsSticker: true });
          await chat.sendMessage('Ini stickernya bos!');
        } catch (error) {
          console.error('Error processing media for sticker:', error);
        }
      }
    } else {
      console.log('Bot was not mentioned, skipping sticker creation.');
    }
  };
  
  module.exports = {
    handleBotMention,
    handleStickerCreation,
    handleReadReceipt, // Export handleReadReceipt
  };
  