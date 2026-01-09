fx_version 'cerulean'
game 'gta5'

name 'inventory'
description 'Inventory system'
author 'Framework'
version '1.0.0'

lua54 'yes'

ui_page 'nui/dist/index.html'

shared_scripts {
    'config.lua'
}

server_scripts {
    'dist/server.js'
}

client_scripts {
    'dist/client.js'
}

files {
    'nui/dist/**/*'
}

dependencies {
    '[core]',
    '[database]'
}
