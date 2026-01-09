fx_version 'cerulean'
game 'gta5'

name 'jobs'
description 'Jobs system'
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
    '[core]',
    '[database]'
}
