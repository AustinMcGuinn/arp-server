import { createSignal, createEffect, For, onCleanup } from "solid-js";
import { useWebSocket } from "../lib/websocket";

interface PlayerEvent {
  type: "join" | "leave";
  name: string;
  time: Date;
}

export default function Dashboard() {
  const { serverStats, subscribe, send } = useWebSocket();
  const [recentEvents, setRecentEvents] = createSignal<PlayerEvent[]>([]);

  createEffect(() => {
    const unsubJoin = subscribe("playerJoined", (data: any) => {
      setRecentEvents((prev) => [
        { type: "join", name: data.name, time: new Date() },
        ...prev.slice(0, 9),
      ]);
    });

    const unsubLeave = subscribe("playerLeft", (data: any) => {
      setRecentEvents((prev) => [
        { type: "leave", name: data.name, time: new Date() },
        ...prev.slice(0, 9),
      ]);
    });

    onCleanup(() => {
      unsubJoin();
      unsubLeave();
    });
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const stats = [
    {
      label: "Online Players",
      value: () => serverStats().onlinePlayers,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Max Players",
      value: () => serverStats().maxPlayers,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Server Uptime",
      value: () => formatUptime(serverStats().uptime),
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div class="space-y-8">
      {/* Header */}
      <div>
        <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        <p class="text-slate-400 mt-1">Server overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <For each={stats}>
          {(stat) => (
            <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class={`p-3 rounded-lg ${stat.bg}`}>
                  <svg class={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p class="text-slate-400 text-sm">{stat.label}</p>
                  <p class="text-2xl font-bold text-white">{stat.value()}</p>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Recent Activity */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        
        {recentEvents().length === 0 ? (
          <p class="text-slate-500 text-center py-8">No recent activity</p>
        ) : (
          <div class="space-y-3">
            <For each={recentEvents()}>
              {(event) => (
                <div class="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div
                    class={`w-2 h-2 rounded-full ${
                      event.type === "join" ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span class="flex-1 text-slate-300">
                    <span class="font-medium text-white">{event.name}</span>
                    {event.type === "join" ? " joined the server" : " left the server"}
                  </span>
                  <span class="text-slate-500 text-sm">{formatTime(event.time)}</span>
                </div>
              )}
            </For>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div class="flex gap-4">
          <button
            class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
            onClick={() => send("getStats", {})}
          >
            Refresh Stats
          </button>
          <button
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            onClick={() => {
              const message = prompt("Enter announcement message:");
              if (message) {
                send("announce", { message, type: "info" });
              }
            }}
          >
            Send Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
