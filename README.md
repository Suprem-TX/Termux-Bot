# WhatsApp Bot con Baileys

## Características

- **Bienvenida y Despedida**:
  - Envia un mensaje de bienvenida a los nuevos participantes en los grupos.
  - Envia un mensaje de despedida cuando alguien abandona el grupo.

- **Autenticación**:
  - El bot guarda su estado de autenticación utilizando un archivo local para mantener la sesión activa entre reinicios.
  - Muestra un código QR para autenticar el bot en WhatsApp.

- **Comando /kick**:
  - Al usar el comando y mencionando al usuario podras expulsarlo
  
## Instalacion

- Intalacion y Actualizacion de Paquetes:
```bash
pkg update -y && pkg update -y
```
```bash
pkg install nodejs -y
```
```bash
pkg install git -y
```
- Intalacion de Librerias:
```bash
npm install @whiskeysockets/baileys
```
```bash
npm install qrcode-terminal
```
## Ejecucion

1. Clona este repositorio:
```bash
git clone https://github.com/Suprem-TX/Termux-Bot.git && cd Termux-Bot
```
```bash
node index.js
```

## USA EL COMANDO /MENU
