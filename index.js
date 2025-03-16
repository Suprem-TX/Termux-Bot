const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const cooldowns = {};
const sentStickers = {};

// Función para iniciar el bot
async function startBot() {
  // Cargar estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  // Crear socket de WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  // Agregar evento para actualizar credenciales
  sock.ev.on('creds.update', saveCreds);

  // Agregar evento para actualizar conexión
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Mostrar código QR si es necesario
    if (qr) {
      console.log("🔄 Escanea el código QR con tu WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    // Reconectar si es necesario
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot conectado con éxito!');
    }
  });

  // Agregar evento para mensajes
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    // Ignorar mensajes sin texto o enviados por el propio bot
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    if (!isGroup) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

  });

  // Evento para detectar cuando un usuario se une o sale del grupo
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'add') {
      // Enviar mensaje de bienvenida a los nuevos usuarios
      for (const participant of participants) {
        const welcomeMessage = `Bienvenido al grupo, @${participant.split('@')[0]}!`;
        await sock.sendMessage(id, { text: welcomeMessage, mentions: [participant] });
      }
    } else if (action === 'remove') {
      // Enviar mensaje de despedida a los usuarios que salieron
      for (const participant of participants) {
        const goodbyeMessage = `Adiós @${participant.split('@')[0]}, ¡hasta pronto!`;
        await sock.sendMessage(id, { text: goodbyeMessage, mentions: [participant] });
      }
    }
  });
}

// Iniciar el bot
startBot();
