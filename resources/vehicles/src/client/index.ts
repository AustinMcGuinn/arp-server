const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Vehicles System (Client)...`);

interface SpawnData {
  vehicleId: number;
  model: string;
  plate: string;
  mods: Record<string, unknown>;
  fuel: number;
  bodyHealth: number;
  engineHealth: number;
  spawnPoint: { x: number; y: number; z: number; heading: number };
}

interface GarageData {
  garageId: string;
  garageLabel: string;
  vehicles: Array<{
    id: number;
    plate: string;
    model: string;
    fuel: number;
    bodyHealth: number;
    engineHealth: number;
  }>;
}

// Owned vehicle keys (plate -> true)
const vehicleKeys: Set<string> = new Set();

// Get garage config
function getGarages(): Record<string, { label: string; position: { x: number; y: number; z: number } }> {
  return (globalThis as any).Config?.Garages ?? {};
}

// Spawn vehicle
async function spawnVehicle(data: SpawnData): Promise<void> {
  const modelHash = GetHashKey(data.model);

  RequestModel(modelHash);
  while (!HasModelLoaded(modelHash)) {
    await Delay(10);
  }

  const vehicle = CreateVehicle(
    modelHash,
    data.spawnPoint.x,
    data.spawnPoint.y,
    data.spawnPoint.z,
    data.spawnPoint.heading,
    true,
    false
  );

  while (!DoesEntityExist(vehicle)) {
    await Delay(10);
  }

  SetVehicleNumberPlateText(vehicle, data.plate);
  SetEntityAsMissionEntity(vehicle, true, true);

  // Apply condition
  SetVehicleBodyHealth(vehicle, data.bodyHealth);
  SetVehicleEngineHealth(vehicle, data.engineHealth);
  SetVehicleFuelLevel(vehicle, data.fuel);

  // Apply mods (basic)
  if (data.mods) {
    SetVehicleModKit(vehicle, 0);
    // Would apply individual mods here
  }

  SetModelAsNoLongerNeeded(modelHash);

  // Add keys
  vehicleKeys.add(data.plate);

  // Get into vehicle
  const ped = PlayerPedId();
  TaskWarpPedIntoVehicle(ped, vehicle, -1);

  // Notify server of spawn
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  emitNet("vehicles:vehicleSpawned", data.vehicleId, netId);
}

// Store vehicle
async function storeVehicle(vehicleNetId: number, garageId: string): Promise<void> {
  const vehicle = NetworkGetEntityFromNetworkId(vehicleNetId);

  if (!DoesEntityExist(vehicle)) return;

  const fuel = GetVehicleFuelLevel(vehicle);
  const bodyHealth = GetVehicleBodyHealth(vehicle);
  const engineHealth = GetVehicleEngineHealth(vehicle);
  const plate = GetVehicleNumberPlateText(vehicle);

  // Get player out of vehicle
  const ped = PlayerPedId();
  if (GetVehiclePedIsIn(ped, false) === vehicle) {
    TaskLeaveVehicle(ped, vehicle, 0);
    await Delay(1500);
  }

  // Delete vehicle
  SetEntityAsMissionEntity(vehicle, false, true);
  DeleteVehicle(vehicle);

  // Remove keys
  vehicleKeys.delete(plate);

  // Get vehicle ID from server and notify
  // For this we'd need to track the mapping on client side
  // For now, server handles this via the vehicleSpawned event
}

// Event handlers
onNet("vehicles:spawnVehicle", (data: SpawnData) => {
  spawnVehicle(data);
});

onNet("vehicles:storeVehicle", async (vehicleNetId: number, garageId: string) => {
  await storeVehicle(vehicleNetId, garageId);
});

onNet("vehicles:showGarage", (data: GarageData) => {
  // For now, just use chat menu
  // In production, you'd open an NUI
  console.log(`Garage: ${data.garageLabel}`);
  console.log(`Vehicles: ${data.vehicles.length}`);

  if (data.vehicles.length === 0) {
    emit("chat:addMessage", {
      args: ["Garage", "No vehicles in this garage"],
    });
    return;
  }

  // Simple menu using chat
  for (const v of data.vehicles) {
    emit("chat:addMessage", {
      args: ["Garage", `${v.model} - ${v.plate} (Fuel: ${Math.round(v.fuel)}%)`],
    });
  }

  // In production, spawn first vehicle or open NUI
  emitNet("vehicles:spawn", data.vehicles[0].id, data.garageId);
});

// Check for garage zones
setTick(async () => {
  await Delay(1000);

  const ped = PlayerPedId();
  const coords = GetEntityCoords(ped, true);
  const garages = getGarages();

  for (const [garageId, garage] of Object.entries(garages)) {
    const distance = GetDistanceBetweenCoords(
      coords[0],
      coords[1],
      coords[2],
      garage.position.x,
      garage.position.y,
      garage.position.z,
      true
    );

    if (distance < 3.0) {
      // Draw marker
      DrawMarker(
        36,
        garage.position.x,
        garage.position.y,
        garage.position.z - 1.0,
        0,
        0,
        0,
        0,
        0,
        0,
        1.5,
        1.5,
        1.0,
        0,
        128,
        255,
        100,
        false,
        true,
        2,
        false,
        "",
        "",
        false
      );

      BeginTextCommandDisplayHelp("STRING");
      AddTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to access ${garage.label}`);
      EndTextCommandDisplayHelp(0, false, true, -1);

      if (IsControlJustPressed(0, 38)) {
        const vehicle = GetVehiclePedIsIn(ped, false);

        if (vehicle !== 0) {
          // Store vehicle
          const plate = GetVehicleNumberPlateText(vehicle);
          if (vehicleKeys.has(plate)) {
            const netId = NetworkGetNetworkIdFromEntity(vehicle);
            emitNet("vehicles:store", netId, garageId);
          } else {
            emit("chat:addMessage", {
              args: ["Garage", "You don't have keys for this vehicle"],
            });
          }
        } else {
          // Open garage
          emitNet("vehicles:openGarage", garageId);
        }
      }
    }
  }
});

// Vehicle keys event
onNet("vehicles:giveKeys", (plate: string) => {
  vehicleKeys.add(plate);
});

onNet("vehicles:removeKeys", (plate: string) => {
  vehicleKeys.delete(plate);
});

function Delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`[${RESOURCE_NAME}] Vehicles System (Client) loaded!`);
