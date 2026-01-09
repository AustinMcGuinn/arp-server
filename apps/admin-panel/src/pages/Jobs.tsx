import { createSignal, createEffect, For, onCleanup, Show } from "solid-js";
import { useWebSocket } from "../lib/websocket";

interface JobGrade {
  grade: number;
  name: string;
  label: string;
  salary: number;
  isBoss: boolean;
}

interface Job {
  name: string;
  label: string;
  grades: JobGrade[];
  isDefault: boolean;
}

export default function Jobs() {
  const { send, subscribe } = useWebSocket();
  const [jobs, setJobs] = createSignal<Job[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [expandedJob, setExpandedJob] = createSignal<string | null>(null);

  createEffect(() => {
    send("getJobs", {});
    setLoading(true);

    const unsub = subscribe("jobs", (data: any) => {
      setJobs(data.jobs);
      setLoading(false);
    });

    onCleanup(unsub);
  });

  const toggleExpand = (jobName: string) => {
    setExpandedJob((prev) => (prev === jobName ? null : jobName));
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white">Jobs</h1>
          <p class="text-slate-400 mt-1">Manage server jobs and grades</p>
        </div>
        <button
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          onClick={() => send("getJobs", {})}
        >
          Refresh
        </button>
      </div>

      {/* Jobs List */}
      <div class="space-y-4">
        <Show
          when={!loading()}
          fallback={
            <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              Loading jobs...
            </div>
          }
        >
          <For each={jobs()}>
            {(job) => (
              <div class="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {/* Job Header */}
                <button
                  class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  onClick={() => toggleExpand(job.name)}
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        class="w-5 h-5 text-brand-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div class="text-left">
                      <h3 class="text-white font-medium">{job.label}</h3>
                      <p class="text-slate-400 text-sm">{job.name}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    {job.isDefault && (
                      <span class="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
                        Default
                      </span>
                    )}
                    <span class="text-slate-400 text-sm">{job.grades.length} grades</span>
                    <svg
                      class={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedJob() === job.name ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Grades */}
                <Show when={expandedJob() === job.name}>
                  <div class="border-t border-slate-800 divide-y divide-slate-800/50">
                    <For each={job.grades}>
                      {(grade) => (
                        <div class="px-6 py-3 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-sm text-slate-400">
                              {grade.grade}
                            </span>
                            <div>
                              <span class="text-white">{grade.label}</span>
                              {grade.isBoss && (
                                <span class="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  Boss
                                </span>
                              )}
                            </div>
                          </div>
                          <span class="text-green-400">${grade.salary}/paycheck</span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
