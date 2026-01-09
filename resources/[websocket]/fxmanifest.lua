fx_version 'cerulean'
game 'gta5'

name 'websocket'
description 'WebSocket server for external integrations'
author 'Framework'
version '1.0.0'

lua54 'yes'

server_scripts {
    'dist/server.js'
}

dependencies {
    '[core]',
    '[database]'
}
