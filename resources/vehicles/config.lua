Config = {}

-- Garage locations
Config.Garages = {
    legion = {
        label = "Legion Square Parking",
        position = { x = 215.8, y = -810.0, z = 30.7 },
        spawnPoints = {
            { x = 228.5, y = -800.0, z = 30.5, heading = 160.0 },
            { x = 232.0, y = -800.0, z = 30.5, heading = 160.0 },
            { x = 235.5, y = -800.0, z = 30.5, heading = 160.0 },
        },
        vehicleTypes = { "car", "motorcycle", "bicycle" }
    },
    pillbox = {
        label = "Pillbox Parking",
        position = { x = 275.0, y = -345.0, z = 45.0 },
        spawnPoints = {
            { x = 270.0, y = -340.0, z = 45.0, heading = 0.0 },
            { x = 274.0, y = -340.0, z = 45.0, heading = 0.0 },
        },
        vehicleTypes = { "car", "motorcycle", "bicycle" }
    },
    airport = {
        label = "Airport Parking",
        position = { x = -945.0, y = -2953.0, z = 13.9 },
        spawnPoints = {
            { x = -950.0, y = -2948.0, z = 13.9, heading = 60.0 },
            { x = -954.0, y = -2946.0, z = 13.9, heading = 60.0 },
        },
        vehicleTypes = { "car" }
    }
}

-- Default fuel
Config.DefaultFuel = 100.0
