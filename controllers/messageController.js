// controllers/messageController.js

// Function to handle read receipts
const handleReadReceipt = (msg) => {
    console.log('Message read:', msg.body);
    
    // You can add additional logic here to handle when a message is read
    // For example, you might want to log it to a database or trigger another event
};

module.exports = {
    handleReadReceipt,
};
