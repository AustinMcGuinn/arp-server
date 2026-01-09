fx_version 'cerulean'
game 'gta5'

name 'character-selection'
description 'Character selection system'
author 'Framework'
version '1.0.0'

lua54 'yes'

ui_page 'nui/dist/index.html'

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
