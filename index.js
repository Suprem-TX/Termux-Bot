const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

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
      const menuMessage = `📜 *Menú del Bot* 📜\n\n` +
        `🔹 */kick @usuario* .`;

      await sock.sendMessage(sender, { text: menuMessage });
    }

    // Comando /kick
    if (text.startsWith('/kick')) {
      const isAdmin = async (jid, user) => {
        const groupMetadata = await sock.groupMetadata(jid);
        const admins = groupMetadata.participants.filter(p => p.admin);
        return admins.some(a => a.id === user);
      };

      if (!msg.key.participant) return;
      const author = msg.key.participant;

      if (!(await isAdmin(sender, author))) {
        return sock.sendMessage(sender, { text: '❌ No tienes permisos de administrador para expulsar usuarios.' });
      }

      const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentionedJid || mentionedJid.length === 0) {
        return sock.sendMessage(sender, { text: '⚠️ Debes mencionar a un usuario para expulsarlo.' });
      }

      await sock.groupParticipantsUpdate(sender, mentionedJid, 'remove');
      await sock.sendMessage(sender, { text: `✅ Usuario expulsado con éxito.` });
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'add') {
      for (const participant of participants) {
        const welcomeMessage = `Bienvenido al grupo, @${participant.split('@')[0]}!`;

        // Imagen de bienvenida
        const welcomeImagePath = path.join(__dirname, 'img/welcome.png');
        if (fs.existsSync(welcomeImagePath)) {
          await sock.sendMessage(id, {
            image: fs.readFileSync(welcomeImagePath),
            caption: welcomeMessage,
            mentions: [participant]
          });
        } else {
          await sock.sendMessage(id, { text: welcomeMessage, mentions: [participant] });
        }
      }
    } else if (action === 'remove') {
      for (const participant of participants) {
        const goodbyeMessage = `Adiós @${participant.split('@')[0]}, te extrañaremos.`;

        // Imagen de despedida
        const goodbyeImagePath = path.join(__dirname, 'img/bye.png');
        if (fs.existsSync(goodbyeImagePath)) {
          await sock.sendMessage(id, {
            image: fs.readFileSync(goodbyeImagePath),
            caption: goodbyeMessage,
            mentions: [participant]
          });
        } else {
          await sock.sendMessage(id, { text: goodbyeMessage, mentions: [participant] });
        }
      }
    }
  });
}

// Iniciar el bot
startBot();
