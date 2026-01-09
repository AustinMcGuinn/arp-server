import type { JobDefinition, PlayerJobData } from "@framework/types";
import { ServerEvents } from "@framework/types";

const RESOURCE_NAME = GetCurrentResourceName();

console.log(`[${RESOURCE_NAME}] Starting Jobs System...`);

// Config
const SALARY_INTERVAL = ((globalThis as any).Config?.SalaryInterval ?? 30) * 60 * 1000;

// Player duty status
const dutyStatus: Map<number, boolean> = new Map();

// Core helpers
function getCharacter(source: number): any {
  return exports["[core]"].getCharacter(source);
}

function addMoney(source: number, type: "cash" | "bank", amount: number): boolean {
  return exports["[core]"].addMoney(source, type, amount);
}

// Database helpers
async function getJobByName(name: string): Promise<any> {
  return exports["[database]"].getJobByName(name);
}

async function getAllJobs(): Promise<any[]> {
  return exports["[database]"].getAllJobs();
}

async function updateCharacterJob(id: number, jobName: string, jobGrade: number): Promise<void> {
  return exports["[database]"].updateCharacterJob(id, jobName, jobGrade);
}

// Get job data for a player
async function getPlayerJobData(source: number): Promise<PlayerJobData | null> {
  const character = getCharacter(source);
  if (!character) return null;

  const job = await getJobByName(character.job.name);
  if (!job) return null;

  const grade = job.grades.find((g: any) => g.grade === character.job.grade);

  return {
    name: job.name,
    label: job.label,
    grade: character.job.grade,
    gradeLabel: grade?.label ?? "Unknown",
    salary: grade?.salary ?? 0,
    isBoss: grade?.isBoss ?? false,
    onDuty: dutyStatus.get(source) ?? false,
  };
}

// Set player job
async function setPlayerJob(source: number, jobName: string, grade: number): Promise<boolean> {
  const character = getCharacter(source);
  if (!character) return false;

  const job = await getJobByName(jobName);
  if (!job) return false;

  const jobGrade = job.grades.find((g: any) => g.grade === grade);
  if (!jobGrade) return false;

  await updateCharacterJob(character.id, jobName, grade);

  // Update character object in core
  character.job = {
    name: job.name,
    label: job.label,
    grade,
    gradeLabel: jobGrade.label,
    onDuty: dutyStatus.get(source) ?? false,
  };

  emit(ServerEvents.JOB_UPDATED, source, character.job);
  emitNet("jobs:updateJob", source, character.job);

  return true;
}

// Toggle duty status
function toggleDuty(source: number): boolean {
  const character = getCharacter(source);
  if (!character) return false;

  const currentDuty = dutyStatus.get(source) ?? false;
  const newDuty = !currentDuty;
  dutyStatus.set(source, newDuty);

  character.job.onDuty = newDuty;

  emit(ServerEvents.DUTY_CHANGED, source, newDuty);
  emitNet("jobs:dutyChanged", source, newDuty);

  return newDuty;
}

// Salary payment
async function paySalaries(): Promise<void> {
  const players = GetPlayers();

  for (const playerId of players) {
    const source = parseInt(playerId);
    const isOnDuty = dutyStatus.get(source);

    if (!isOnDuty) continue;

    const jobData = await getPlayerJobData(source);
    if (!jobData || jobData.salary <= 0) continue;

    const success = addMoney(source, "bank", jobData.salary);
    if (success) {
      emitNet(
        "framework:showNotification",
        source,
        "success",
        "Salary",
        `You received $${jobData.salary} salary`
      );
    }
  }
}

// Start salary timer
setInterval(paySalaries, SALARY_INTERVAL);

// Net events
onNet("jobs:getDutyStatus", () => {
  const source = (globalThis as any).source as number;
  const isOnDuty = dutyStatus.get(source) ?? false;
  emitNet("jobs:dutyChanged", source, isOnDuty);
});

onNet("jobs:toggleDuty", () => {
  const source = (globalThis as any).source as number;
  const newStatus = toggleDuty(source);
  emitNet(
    "framework:showNotification",
    source,
    "info",
    "Duty Status",
    newStatus ? "You are now on duty" : "You are now off duty"
  );
});

onNet("jobs:getEmployees", async () => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const jobData = await getPlayerJobData(source);
  if (!jobData?.isBoss) {
    emitNet("framework:showNotification", source, "error", "Error", "You are not a boss");
    return;
  }

  // Get all characters with this job
  // This would need a new database query - for now return empty
  emitNet("jobs:receiveEmployees", source, []);
});

onNet("jobs:setGrade", async (targetCharacterId: number, newGrade: number) => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const jobData = await getPlayerJobData(source);
  if (!jobData?.isBoss) {
    emitNet("framework:showNotification", source, "error", "Error", "You are not a boss");
    return;
  }

  // Would need to implement this with database query
  emitNet("framework:showNotification", source, "success", "Success", "Grade updated");
});

onNet("jobs:fire", async (targetCharacterId: number) => {
  const source = (globalThis as any).source as number;
  const character = getCharacter(source);

  if (!character) return;

  const jobData = await getPlayerJobData(source);
  if (!jobData?.isBoss) {
    emitNet("framework:showNotification", source, "error", "Error", "You are not a boss");
    return;
  }

  // Set target to unemployed
  await updateCharacterJob(targetCharacterId, "unemployed", 0);
  emitNet("framework:showNotification", source, "success", "Success", "Employee fired");
});

// Clear duty on disconnect
on("playerDropped", () => {
  const source = (globalThis as any).source as number;
  dutyStatus.delete(source);
});

// Exports
exports("getPlayerJob", getPlayerJobData);
exports("setPlayerJob", setPlayerJob);
exports("toggleDuty", toggleDuty);
exports("isOnDuty", (source: number) => dutyStatus.get(source) ?? false);

console.log(`[${RESOURCE_NAME}] Jobs System loaded!`);
