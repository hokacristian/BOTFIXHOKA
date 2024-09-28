// controllers/kickController.js

// Handle group kick command
const handleGroupKick = async (msg, chat, client) => {
    const participants = chat.participants;
    const senderParticipant = participants.find(p => p.id._serialized === msg.author || msg.from);
  
    if (!senderParticipant || !senderParticipant.isAdmin) {
      return msg.reply('Only group admins can use this command.');
    }
  
    const botParticipant = participants.find(p => p.id._serialized === client.info.wid._serialized);
    if (!botParticipant || !botParticipant.isAdmin) {
      return msg.reply('I need to be an admin to perform this action.');
    }
  
    const args = msg.body.split(' ');
    let targetNumber = args[1];
    targetNumber = formatTargetNumber(msg, targetNumber);
  
    if (!targetNumber) {
      return msg.reply('Please specify a valid WhatsApp ID or mention the user.');
    }
  
    try {
      await chat.removeParticipants([targetNumber]);
      msg.reply(`User ${targetNumber} Telah berhasil dikick dari group.`);
    } catch (error) {
      msg.reply(`Failed to remove ${targetNumber}. Make sure the bot has admin rights.`);
      console.error('Error removing participant:', error);
    }
  };
  
  // Format target number for kicking
  const formatTargetNumber = (msg, targetNumber) => {
    if (msg.mentionedIds && msg.mentionedIds.length > 0) {
      return msg.mentionedIds[0];
    } else if (targetNumber && !targetNumber.includes('@')) {
      return `${targetNumber}@c.us`;
    }
    return null;
  };
  
  module.exports = {
    handleGroupKick,
  };
  