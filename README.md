# WhatsApp Bot - SupremTX Bot

Este es un bot de WhatsApp basado en [Baileys](https://github.com/adiwajshing/Baileys), diseñado para automatizar diversas funciones en grupos de WhatsApp. El bot tiene varias características útiles, como generar stickers, dar la bienvenida y despedirse de los usuarios, eliminar links y mucho más.

## Características

- **Bienvenida y despedida de usuarios**: El bot envía un mensaje de bienvenida cuando un nuevo usuario se une al grupo y un mensaje de despedida cuando alguien sale.
- **Generación de stickers**: Permite convertir imágenes o videos en stickers de WhatsApp (máximo 6 segundos para videos).
- **Eliminación de links**: El bot puede eliminar automáticamente los enlaces enviados en el chat.
- **Eliminación manual de mensajes**: Con el comando `.delete`, los administradores pueden eliminar mensajes de manera manual.
- **Comando `.mediafire`**: Permite descargar archivos desde MediaFire usando un enlace proporcionado.

## Requisitos

- Node.js (>=14.x)
- npm (gestor de paquetes de Node.js)
- ffmpeg (necesario para la conversión de videos a stickers)

## Instalación

### 1. Clonar el repositorio

Primero, clona este repositorio en tu máquina:

```bash
git clone https://github.com/tu_usuario/whatsapp-bot.git
cd whatsapp-bot
