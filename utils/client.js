// utils/client.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const { sessionPath } = require('../config/config');
const chrome = require('@sparticuz/chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const isVercel = process.env.NODE_ENV === 'production'; // Check if running in Vercel (or production)


let client;

// Function to initialize the WhatsApp client
const initializeClient = async () => {
    if (!client) {
        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: sessionPath,
                clientId: 'client-one',
            }),
            puppeteer: {
                executablePath: isVercel
                    ? await chrome.executablePath
                    : puppeteer.executablePath(), // Use puppeteer's default executablePath for local development
                args: isVercel ? [...chrome.args, '--no-sandbox', '--disable-setuid-sandbox'] : [],
                headless: true,
            },
        });

        client.on('qr', (qr) => {
            const qrcode = require('qrcode-terminal');
            qrcode.generate(qr, { small: true });
            console.log('QR code received, scan it using your WhatsApp app.');
        });

        client.on('ready', () => {
            console.log('WhatsApp Client is ready!');

            // Event listener for new messages after the client is ready
            client.on('message', async (msg) => {
                const chat = await msg.getChat();

                // Check if the message mentions the bot
                if (msg.mentionedIds && msg.mentionedIds.includes(client.info.wid._serialized)) {
                    // Check if the message has an image
                    if (msg.hasMedia && msg.type === 'image') {
                        try {
                            // Download the image
                            const media = await msg.downloadMedia();

                            // Send the image back as a sticker
                            await chat.sendMessage(media, { sendMediaAsSticker: true });
                            await chat.sendMessage('Ini dia Bos stickernya!');

                        } catch (error) {
                            console.error('Error processing media:', error);
                        }
                    } else {
                        // Handle other cases where the bot is mentioned
                        if (chat.isGroup) {
                            const participants = chat.participants;

                            // Fetch IDs of all valid participants
                            const validParticipants = participants.filter(p => p.id && p.id._serialized);
                            const mentionIds = validParticipants.map(p => p.id._serialized);

                            // Create a string mentioning all valid participants in the group
                            const mentionsText = validParticipants.map(p => `@${p.id.user}`).join(' ');

                            // Send a message tagging everyone
                            try {
                                await chat.sendMessage(mentionsText, { mentions: mentionIds });
                            } catch (error) {
                                console.error('Error sending message:', error);
                            }
                        } else {
                            // Handle direct mentions in private chats
                            try {
                                await chat.sendMessage('Hello! How can I assist you today?');
                            } catch (error) {
                                console.error('Error sending message:', error);
                            }
                        }
                    }
                } else if (chat.isGroup && msg.body.toLowerCase().startsWith('!kick')) {
                    // The message starts with '!kick' in a group chat
                    // Get the list of participants
                    const participants = chat.participants;

                    // Check if the message sender is an admin
                    const senderId = msg.author || msg.from; // In groups, msg.author is the sender
                    const senderParticipant = participants.find(p => p.id._serialized === senderId);

                    if (!senderParticipant || !senderParticipant.isAdmin) {
                        return msg.reply('Only group admins can use this command.');
                    }

                    // Check if the bot is an admin
                    const botParticipant = participants.find(p => p.id._serialized === client.info.wid._serialized);
                    if (!botParticipant || !botParticipant.isAdmin) {
                        return msg.reply('I need to be an admin to perform this action.');
                    }

                    // Extract the user ID to be kicked from the message body
                    const args = msg.body.split(' ');
                    let targetNumber = args[1]; // Get the number to be kicked

                    // Validate and format the target number
                    if (msg.mentionedIds && msg.mentionedIds.length > 0) {
                        // If a user was mentioned, use their ID
                        targetNumber = msg.mentionedIds[0];
                    } else if (targetNumber && !targetNumber.includes('@')) {
                        // If a number was provided without the domain, add '@c.us'
                        targetNumber += '@c.us';
                    }

                    // Ensure the target number is valid
                    if (!targetNumber || !targetNumber.includes('@')) {
                        return msg.reply('Please specify a valid WhatsApp ID (e.g., 6281234567890@c.us) or mention the user.');
                    }

                    // Kick the participant from the group
                    try {
                        await chat.removeParticipants([targetNumber]);
                        msg.reply(`User ${targetNumber} Telah Berhasil Dikick Dari Group.`);
                    } catch (error) {
                        msg.reply(`Failed to remove ${targetNumber}. Make sure the bot has admin rights.`);
                        console.error('Error removing participant:', error);
                    }
                }
            });
        });

        client.on('message_ack', (msg, ack) => {
            if (ack === 3) { // Ack 3 means the message is read
                const { handleReadReceipt } = require('../controllers/messageController');
                try {
                    handleReadReceipt(msg);
                } catch (error) {
                    console.error('Error handling read receipt:', error);
                }
            }
        });

        client.on('error', (error) => {
            console.error('Client encountered an error:', error);
        });

        await client.initialize();
    }

    return client;
};

// Function to get the current client
const getClient = () => {
    if (!client || !client.info) {
        console.error('WhatsApp client is not initialized or authenticated.');
        return null;
    }
    return client;
};

// Function to check if the client is authenticated
const isAuthenticated = () => {
    return client && client.info && client.info.wid && client.info.pushname;
};

module.exports = {
    initializeClient,
    getClient,
    isAuthenticated,
};
