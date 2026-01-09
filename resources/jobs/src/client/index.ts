const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Jobs System (Client)...`);

interface JobData {
  name: string;
  label: string;
  grade: number;
  gradeLabel: string;
  onDuty: boolean;
}

let currentJob: JobData | null = null;
let isOnDuty = false;

// Get config
function getDutyLocations(): Record<string, Array<{ x: number; y: number; z: number }>> {
  return (globalThis as any).Config?.DutyLocations ?? {};
}

function getBossLocations(): Record<string, { x: number; y: number; z: number }> {
  return (globalThis as any).Config?.BossLocations ?? {};
}

// Event handlers
onNet("jobs:updateJob", (job: JobData) => {
  currentJob = job;
  isOnDuty = job.onDuty;
});

onNet("jobs:dutyChanged", (onDuty: boolean) => {
  isOnDuty = onDuty;
});

// Commands
RegisterCommand(
  "duty",
  () => {
    emitNet("jobs:toggleDuty");
  },
  false
);

RegisterCommand(
  "job",
  () => {
    if (currentJob) {
      console.log(`Current Job: ${currentJob.label} - ${currentJob.gradeLabel}`);
      console.log(`On Duty: ${isOnDuty}`);
    }
  },
  false
);

// Duty zone check
setTick(async () => {
  await Delay(1000);

  if (!currentJob) return;

  const ped = PlayerPedId();
  const coords = GetEntityCoords(ped, true);
  const dutyLocations = getDutyLocations()[currentJob.name];

  if (!dutyLocations) return;

  for (const loc of dutyLocations) {
    const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], loc.x, loc.y, loc.z, true);

    if (distance < 2.0) {
      // Draw marker
      DrawMarker(
        27,
        loc.x,
        loc.y,
        loc.z - 1.0,
        0,
        0,
        0,
        0,
        0,
        0,
        1.0,
        1.0,
        0.5,
        0,
        255,
        0,
        100,
        false,
        true,
        2,
        false,
        "",
        "",
        false
      );

      // Show help text
      BeginTextCommandDisplayHelp("STRING");
      AddTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to toggle duty`);
      EndTextCommandDisplayHelp(0, false, true, -1);

      if (IsControlJustPressed(0, 38)) {
        // E key
        emitNet("jobs:toggleDuty");
      }
    }
  }
});

// Boss menu zone check
setTick(async () => {
  await Delay(1000);

  if (!currentJob) return;

  const ped = PlayerPedId();
  const coords = GetEntityCoords(ped, true);
  const bossLocation = getBossLocations()[currentJob.name];

  if (!bossLocation) return;

  const distance = GetDistanceBetweenCoords(
    coords[0],
    coords[1],
    coords[2],
    bossLocation.x,
    bossLocation.y,
    bossLocation.z,
    true
  );

  if (distance < 2.0) {
    // Draw marker
    DrawMarker(
      29,
      bossLocation.x,
      bossLocation.y,
      bossLocation.z - 1.0,
      0,
      0,
      0,
      0,
      0,
      0,
      1.0,
      1.0,
      0.5,
      255,
      128,
      0,
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
    AddTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to open boss menu`);
    EndTextCommandDisplayHelp(0, false, true, -1);

    if (IsControlJustPressed(0, 38)) {
      emitNet("jobs:getEmployees");
    }
  }
});

function Delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`[${RESOURCE_NAME}] Jobs System (Client) loaded!`);
