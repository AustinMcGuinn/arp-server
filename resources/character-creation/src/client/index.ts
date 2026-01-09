const RESOURCE_NAME = GetCurrentResourceName();

let isOpen = false;
let camera: number | null = null;
let previewPed: number | null = null;

// Camera settings
const CAMERA_OFFSET = { x: 0, y: 2.0, z: 0.5 };
const SPAWN_COORDS = { x: 402.89, y: -996.87, z: -99.0, heading: 180.0 };

console.log(`[${RESOURCE_NAME}] Starting Character Creation (Client)...`);

// Open character creation
onNet("character-creation:open", async () => {
  if (isOpen) return;

  isOpen = true;

  // Teleport to creation room
  const ped = PlayerPedId();
  SetEntityCoords(ped, SPAWN_COORDS.x, SPAWN_COORDS.y, SPAWN_COORDS.z, false, false, false, false);
  SetEntityHeading(ped, SPAWN_COORDS.heading);
  FreezeEntityPosition(ped, true);

  // Wait for area to load
  RequestCollisionAtCoord(SPAWN_COORDS.x, SPAWN_COORDS.y, SPAWN_COORDS.z);
  await wait(500);

  // Setup camera
  setupCamera();

  // Set default appearance
  await setDefaultAppearance("male");

  // Hide HUD
  DisplayRadar(false);
  DisplayHud(false);

  // Open NUI
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: "open",
    data: { gender: "male" },
  });
});

// Close character creation
onNet("character-creation:close", () => {
  if (!isOpen) return;

  isOpen = false;

  destroyCamera();

  // Unfreeze player
  const ped = PlayerPedId();
  FreezeEntityPosition(ped, false);

  // Close NUI
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: "close",
    data: {},
  });
});

function setupCamera(): void {
  const ped = PlayerPedId();
  const coords = GetEntityCoords(ped, true);

  camera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  SetCamCoord(camera, coords[0] + CAMERA_OFFSET.x, coords[1] + CAMERA_OFFSET.y, coords[2] + CAMERA_OFFSET.z);
  PointCamAtEntity(camera, ped, 0, 0, 0, true);
  SetCamActive(camera, true);
  RenderScriptCams(true, true, 500, true, true);
}

function destroyCamera(): void {
  if (camera) {
    RenderScriptCams(false, true, 500, true, true);
    DestroyCam(camera, true);
    camera = null;
  }
}

async function setDefaultAppearance(gender: "male" | "female"): Promise<void> {
  const model = gender === "male" ? "mp_m_freemode_01" : "mp_f_freemode_01";
  const modelHash = GetHashKey(model);

  RequestModel(modelHash);
  while (!HasModelLoaded(modelHash)) {
    await wait(10);
  }

  SetPlayerModel(PlayerId(), modelHash);
  SetModelAsNoLongerNeeded(modelHash);

  const ped = PlayerPedId();

  // Set default head blend
  SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.0, false);

  // Clear default clothing
  SetPedDefaultComponentVariation(ped);

  // Set basic clothing
  SetPedComponentVariation(ped, 3, 15, 0, 0); // Torso
  SetPedComponentVariation(ped, 4, 21, 0, 0); // Legs
  SetPedComponentVariation(ped, 6, 34, 0, 0); // Shoes
  SetPedComponentVariation(ped, 8, 15, 0, 0); // Undershirt
  SetPedComponentVariation(ped, 11, 15, 0, 0); // Jacket
}

// NUI Callbacks
RegisterNuiCallbackType("setGender");
on("__cfx_nui:setGender", async (data: { gender: "male" | "female" }, cb: (result: unknown) => void) => {
  await setDefaultAppearance(data.gender);
  cb({ success: true });
});

RegisterNuiCallbackType("updateAppearance");
on("__cfx_nui:updateAppearance", (data: any, cb: (result: unknown) => void) => {
  const ped = PlayerPedId();

  // Update head blend
  if (data.headBlend) {
    const hb = data.headBlend;
    SetPedHeadBlendData(
      ped,
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

  // Update face features
  if (data.faceFeatures) {
    data.faceFeatures.forEach((value: number, index: number) => {
      SetPedFaceFeature(ped, index, value);
    });
  }

  // Update head overlays
  if (data.headOverlays) {
    Object.entries(data.headOverlays).forEach(([index, overlay]: [string, any]) => {
      SetPedHeadOverlay(ped, parseInt(index), overlay.index, overlay.opacity);
      if (overlay.color !== undefined) {
        SetPedHeadOverlayColor(ped, parseInt(index), 1, overlay.color, overlay.secondColor || overlay.color);
      }
    });
  }

  // Update hair color
  if (data.hairColor) {
    SetPedHairColor(ped, data.hairColor.primary, data.hairColor.secondary);
  }

  // Update eye color
  if (data.eyeColor !== undefined) {
    SetPedEyeColor(ped, data.eyeColor);
  }

  // Update components (clothing)
  if (data.components) {
    Object.entries(data.components).forEach(([index, comp]: [string, any]) => {
      SetPedComponentVariation(ped, parseInt(index), comp.drawable, comp.texture, comp.palette || 0);
    });
  }

  // Update props
  if (data.props) {
    Object.entries(data.props).forEach(([index, prop]: [string, any]) => {
      if (prop.drawable === -1) {
        ClearPedProp(ped, parseInt(index));
      } else {
        SetPedPropIndex(ped, parseInt(index), prop.drawable, prop.texture, true);
      }
    });
  }

  cb({ success: true });
});

RegisterNuiCallbackType("rotateCamera");
on("__cfx_nui:rotateCamera", (data: { direction: "left" | "right" }, cb: (result: unknown) => void) => {
  const ped = PlayerPedId();
  const currentHeading = GetEntityHeading(ped);
  const newHeading = data.direction === "left" ? currentHeading + 10 : currentHeading - 10;
  SetEntityHeading(ped, newHeading);
  cb({ success: true });
});

RegisterNuiCallbackType("setCameraZoom");
on("__cfx_nui:setCameraZoom", (data: { zoom: "face" | "body" | "full" }, cb: (result: unknown) => void) => {
  if (!camera) return cb({ success: false });

  const ped = PlayerPedId();
  const coords = GetEntityCoords(ped, true);

  const zoomSettings = {
    face: { y: 0.8, z: 0.65 },
    body: { y: 1.5, z: 0.3 },
    full: { y: 2.5, z: 0.0 },
  };

  const zoom = zoomSettings[data.zoom];
  SetCamCoord(camera, coords[0], coords[1] + zoom.y, coords[2] + zoom.z);

  cb({ success: true });
});

RegisterNuiCallbackType("save");
on("__cfx_nui:save", (data: any, cb: (result: unknown) => void) => {
  const ped = PlayerPedId();
  const model = GetEntityModel(ped);

  // Build appearance data
  const appearance = {
    model: model === GetHashKey("mp_m_freemode_01") ? "mp_m_freemode_01" : "mp_f_freemode_01",
    headBlend: data.headBlend || {
      shapeFirst: 0,
      shapeSecond: 0,
      shapeThird: 0,
      skinFirst: 0,
      skinSecond: 0,
      skinThird: 0,
      shapeMix: 0.5,
      skinMix: 0.5,
      thirdMix: 0.0,
    },
    faceFeatures: data.faceFeatures || Array(20).fill(0),
    headOverlays: data.headOverlays || {},
    hairColor: data.hairColor || { primary: 0, secondary: 0 },
    eyeColor: data.eyeColor || 0,
    components: data.components || {},
    props: data.props || {},
  };

  // Send to server
  emitNet("character-creation:save", {
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    gender: data.gender,
    appearance,
  });

  cb({ success: true });
});

RegisterNuiCallbackType("cancel");
on("__cfx_nui:cancel", (_data: unknown, cb: (result: unknown) => void) => {
  emitNet("character-creation:cancel");
  cb({ success: true });
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`[${RESOURCE_NAME}] Character Creation (Client) loaded!`);
