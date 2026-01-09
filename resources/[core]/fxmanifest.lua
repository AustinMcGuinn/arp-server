fx_version 'cerulean'
game 'gta5'

name 'core'
description 'Core framework resource'
author 'Framework'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'config.lua'
}

server_scripts {
    'dist/server.js'
}

client_scripts {
    'dist/client.js'
}

dependencies {
    '/server:5848',
    '/onesync'
}
