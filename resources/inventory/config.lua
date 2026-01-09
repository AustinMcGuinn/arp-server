Config = {}

-- Inventory Settings
Config.MaxWeight = 100000 -- in grams
Config.MaxSlots = 40

-- Drop Settings
Config.DropDespawnTime = 300 -- seconds

-- Item Definitions
Config.Items = {
    -- Food
    ['burger'] = {
        label = 'Burger',
        description = 'A delicious burger',
        weight = 200,
        stackable = true,
        maxStack = 10,
        usable = true,
        unique = false,
        image = 'burger.png',
        category = 'food'
    },
    ['water'] = {
        label = 'Water Bottle',
        description = 'Fresh water',
        weight = 500,
        stackable = true,
        maxStack = 10,
        usable = true,
        unique = false,
        image = 'water.png',
        category = 'drink'
    },
    -- Medical
    ['bandage'] = {
        label = 'Bandage',
        description = 'Basic medical bandage',
        weight = 50,
        stackable = true,
        maxStack = 20,
        usable = true,
        unique = false,
        image = 'bandage.png',
        category = 'medical'
    },
    ['medikit'] = {
        label = 'First Aid Kit',
        description = 'Full medical kit',
        weight = 500,
        stackable = true,
        maxStack = 5,
        usable = true,
        unique = false,
        image = 'medikit.png',
        category = 'medical'
    },
    -- Misc
    ['phone'] = {
        label = 'Phone',
        description = 'Your personal phone',
        weight = 100,
        stackable = false,
        maxStack = 1,
        usable = true,
        unique = true,
        image = 'phone.png',
        category = 'misc'
    },
    ['id_card'] = {
        label = 'ID Card',
        description = 'Your identification card',
        weight = 10,
        stackable = false,
        maxStack = 1,
        usable = true,
        unique = true,
        image = 'id_card.png',
        category = 'misc'
    }
}
