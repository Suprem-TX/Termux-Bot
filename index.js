const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const cooldowns = {};
const sentStickers = {};

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("🔄 Escanea el código QR con tu WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot conectado con éxito!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    if (!isGroup) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    // Comando /menu
    if (text === '/menu') {
      const menuMessage = `📜 *Menu del Bot* 📜\n\n` +
        `BOT QUE DA LA BIENVENIDA Y DESPEDIDA\n` +
        `🔹 *Mas funciones proximamente...*`;

      await sock.sendMessage(sender, { text: menuMessage });
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'add') {
      // DA LA BIENVENIDA
      for (const participant of participants) {
        const welcomeMessage = `Bienvenido al grupo, @${participant.split('@')[0]}!`;
        await sock.sendMessage(id, { text: welcomeMessage, mentions: [participant] });
      }
    } else if (action === 'remove') {
      // MUESTRA QUIEN SALIO 
      for (const participant of participants) {
        const goodbyeMessage = `Adios @${participant.split('@')[0]}, `;
        await sock.sendMessage(id, { text: goodbyeMessage, mentions: [participant] });
      }
    }
  });
}

// Iniciar el bot
startBot();
