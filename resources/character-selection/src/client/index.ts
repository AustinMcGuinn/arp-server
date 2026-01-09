const RESOURCE_NAME = GetCurrentResourceName();

let isOpen = false;
let camera: number | null = null;

// Camera position for character selection
const CAMERA_COORDS = { x: -75.53, y: -818.96, z: 326.18 };
const CAMERA_ROT = { x: -10.0, y: 0.0, z: -90.0 };

console.log(`[${RESOURCE_NAME}] Starting Character Selection (Client)...`);

// Open character selection
function openCharacterSelect(): void {
  if (isOpen) return;

  isOpen = true;

  // Setup camera
  setupCamera();

  // Hide HUD
  DisplayRadar(false);
  DisplayHud(false);

  // Freeze player
  const ped = PlayerPedId();
  FreezeEntityPosition(ped, true);
  SetEntityVisible(ped, false, false);

  // Open NUI
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: "open",
    data: {},
  });

  // Request characters from server
  emitNet("character-selection:getCharacters");
}

// Close character selection
function closeCharacterSelect(): void {
  if (!isOpen) return;

  isOpen = false;

  // Destroy camera
  destroyCamera();

  // Show HUD
  DisplayRadar(true);
  DisplayHud(true);

  // Close NUI
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: "close",
    data: {},
  });
}

// Setup selection camera
function setupCamera(): void {
  camera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  SetCamCoord(camera, CAMERA_COORDS.x, CAMERA_COORDS.y, CAMERA_COORDS.z);
  SetCamRot(camera, CAMERA_ROT.x, CAMERA_ROT.y, CAMERA_ROT.z, 2);
  SetCamActive(camera, true);
  RenderScriptCams(true, true, 500, true, true);
}

// Destroy camera
function destroyCamera(): void {
  if (camera) {
    RenderScriptCams(false, true, 500, true, true);
    DestroyCam(camera, true);
    camera = null;
  }
}

// Event handlers
onNet("framework:openCharacterSelect", () => {
  openCharacterSelect();
});

onNet("character-selection:receiveCharacters", (data: { characters: any[]; maxCharacters: number }) => {
  SendNUIMessage({
    action: "setCharacters",
    data,
  });
});

onNet("character-selection:spawnCharacter", async (data: { appearance: any; position: any }) => {
  closeCharacterSelect();

  const ped = PlayerPedId();

  // Apply appearance
  if (data.appearance) {
    await applyAppearance(ped, data.appearance);
  }

  // Teleport to position
  const pos = data.position;
  SetEntityCoords(ped, pos.x, pos.y, pos.z, false, false, false, false);
  SetEntityHeading(ped, pos.heading || 0);

  // Unfreeze and show player
  FreezeEntityPosition(ped, false);
  SetEntityVisible(ped, true, false);

  // Wait for collision
  RequestCollisionAtCoord(pos.x, pos.y, pos.z);
  while (!HasCollisionLoadedAroundEntity(ped)) {
    await wait(10);
  }
});

// Apply character appearance
async function applyAppearance(ped: number, appearance: any): Promise<void> {
  // Load model
  const modelHash = GetHashKey(appearance.model || "mp_m_freemode_01");
  RequestModel(modelHash);
  while (!HasModelLoaded(modelHash)) {
    await wait(10);
  }

  SetPlayerModel(PlayerId(), modelHash);
  SetModelAsNoLongerNeeded(modelHash);

  const newPed = PlayerPedId();

  // Apply head blend
  if (appearance.headBlend) {
    const hb = appearance.headBlend;
    SetPedHeadBlendData(
      newPed,
      hb.shapeFirst,
      hb.shapeSecond,
      hb.shapeThird,
      hb.skinFirst,
      hb.skinSecond,
      hb.skinThird,
      hb.shapeMix,
      hb.skinMix,
      hb.thirdMix,
      false
    );
  }

  // Apply face features
  if (appearance.faceFeatures) {
    appearance.faceFeatures.forEach((value: number, index: number) => {
      SetPedFaceFeature(newPed, index, value);
    });
  }

  // Apply head overlays
  if (appearance.headOverlays) {
    Object.entries(appearance.headOverlays).forEach(([index, overlay]: [string, any]) => {
      SetPedHeadOverlay(newPed, parseInt(index), overlay.index, overlay.opacity);
      if (overlay.color !== undefined) {
        SetPedHeadOverlayColor(newPed, parseInt(index), 1, overlay.color, overlay.secondColor || overlay.color);
      }
    });
  }

  // Apply components
  if (appearance.components) {
    Object.entries(appearance.components).forEach(([index, comp]: [string, any]) => {
      SetPedComponentVariation(newPed, parseInt(index), comp.drawable, comp.texture, comp.palette || 0);
    });
  }

  // Apply props
  if (appearance.props) {
    Object.entries(appearance.props).forEach(([index, prop]: [string, any]) => {
      if (prop.drawable === -1) {
        ClearPedProp(newPed, parseInt(index));
      } else {
        SetPedPropIndex(newPed, parseInt(index), prop.drawable, prop.texture, true);
      }
    });
  }

  // Apply hair color
  if (appearance.hairColor) {
    SetPedHairColor(newPed, appearance.hairColor.primary, appearance.hairColor.secondary);
  }

  // Apply eye color
  if (appearance.eyeColor !== undefined) {
    SetPedEyeColor(newPed, appearance.eyeColor);
  }
}

// NUI Callbacks
RegisterNuiCallbackType("selectCharacter");
on("__cfx_nui:selectCharacter", (data: { id: number }, cb: (result: unknown) => void) => {
  emitNet("character-selection:selectCharacter", data.id);
  cb({ success: true });
});

RegisterNuiCallbackType("deleteCharacter");
on("__cfx_nui:deleteCharacter", (data: { id: number }, cb: (result: unknown) => void) => {
  emitNet("character-selection:deleteCharacter", data.id);
  cb({ success: true });
});

RegisterNuiCallbackType("createNew");
on("__cfx_nui:createNew", (_data: unknown, cb: (result: unknown) => void) => {
  emitNet("character-selection:createNew");
  closeCharacterSelect();
  cb({ success: true });
});

RegisterNuiCallbackType("closeNui");
on("__cfx_nui:closeNui", (_data: unknown, cb: (result: unknown) => void) => {
  // Don't allow closing character select without selecting
  cb({ success: false });
});

// Helper
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`[${RESOURCE_NAME}] Character Selection (Client) loaded!`);
