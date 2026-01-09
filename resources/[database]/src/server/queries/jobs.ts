import { eq } from "drizzle-orm";
import { db } from "../connection";
import { jobs, type Job, type NewJob } from "../schema";

/**
 * Get all jobs
 */
export async function getAllJobs(): Promise<Job[]> {
  return db.query.jobs.findMany();
}

/**
 * Get job by name
 */
export async function getJobByName(name: string): Promise<Job | undefined> {
  return db.query.jobs.findFirst({
    where: eq(jobs.name, name),
  });
}

/**
 * Create job
 */
export async function createJob(data: NewJob): Promise<void> {
  await db.insert(jobs).values(data);
}

/**
 * Update job
 */
export async function updateJob(name: string, data: Partial<NewJob>): Promise<void> {
  await db.update(jobs).set(data).where(eq(jobs.name, name));
}

/**
 * Delete job
 */
export async function deleteJob(name: string): Promise<void> {
  await db.delete(jobs).where(eq(jobs.name, name));
}

/**
 * Get default job
 */
export async function getDefaultJob(): Promise<Job | undefined> {
  return db.query.jobs.findFirst({
    where: eq(jobs.isDefault, true),
  });
}

/**
 * Seed default jobs
 */
export async function seedDefaultJobs(): Promise<void> {
  const defaultJobs: NewJob[] = [
    {
      name: "unemployed",
      label: "Unemployed",
      isDefault: true,
      grades: [
        { grade: 0, name: "unemployed", label: "Unemployed", salary: 0, isBoss: false },
      ],
    },
    {
      name: "police",
      label: "Los Santos Police Department",
      isDefault: false,
      grades: [
        { grade: 0, name: "cadet", label: "Cadet", salary: 500, isBoss: false },
        { grade: 1, name: "officer", label: "Officer", salary: 750, isBoss: false },
        { grade: 2, name: "sergeant", label: "Sergeant", salary: 1000, isBoss: false },
        { grade: 3, name: "lieutenant", label: "Lieutenant", salary: 1250, isBoss: false },
        { grade: 4, name: "captain", label: "Captain", salary: 1500, isBoss: true },
        { grade: 5, name: "chief", label: "Chief", salary: 2000, isBoss: true },
      ],
    },
    {
      name: "ambulance",
      label: "Emergency Medical Services",
      isDefault: false,
      grades: [
        { grade: 0, name: "trainee", label: "Trainee", salary: 500, isBoss: false },
        { grade: 1, name: "emt", label: "EMT", salary: 700, isBoss: false },
        { grade: 2, name: "paramedic", label: "Paramedic", salary: 900, isBoss: false },
        { grade: 3, name: "doctor", label: "Doctor", salary: 1200, isBoss: false },
        { grade: 4, name: "chief", label: "Chief of Medicine", salary: 1500, isBoss: true },
      ],
    },
    {
      name: "mechanic",
      label: "Mechanic",
      isDefault: false,
      grades: [
        { grade: 0, name: "trainee", label: "Trainee", salary: 300, isBoss: false },
        { grade: 1, name: "mechanic", label: "Mechanic", salary: 500, isBoss: false },
        { grade: 2, name: "senior", label: "Senior Mechanic", salary: 700, isBoss: false },
        { grade: 3, name: "manager", label: "Manager", salary: 1000, isBoss: true },
      ],
    },
  ];

  for (const job of defaultJobs) {
    const existing = await getJobByName(job.name);
    if (!existing) {
      await createJob(job);
    }
  }
}
