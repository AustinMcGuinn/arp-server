import { createSignal } from "solid-js";
import { useWebSocket } from "../lib/websocket";
import { authStore, logout } from "../lib/auth";

export default function Settings() {
  const { isConnected, disconnect } = useWebSocket();
  const [wsUrl, setWsUrl] = createSignal(import.meta.env.VITE_WS_URL || "ws://localhost:3001");

  const handleLogout = () => {
    disconnect();
    logout();
    window.location.href = "/login";
  };

  return (
    <div class="space-y-8">
      {/* Header */}
      <div>
        <h1 class="text-3xl font-bold text-white">Settings</h1>
        <p class="text-slate-400 mt-1">Manage your admin panel settings</p>
      </div>

      {/* Connection Settings */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Connection</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <p class="text-white">WebSocket Status</p>
              <p class="text-slate-400 text-sm">Connection to game server</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                class={`w-3 h-3 rounded-full ${isConnected() ? "bg-green-500" : "bg-red-500"}`}
              />
              <span class={isConnected() ? "text-green-400" : "text-red-400"}>
                {isConnected() ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              WebSocket URL
            </label>
            <input
              type="text"
              value={wsUrl()}
              onInput={(e) => setWsUrl(e.currentTarget.value)}
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="ws://localhost:3001"
            />
          </div>
        </div>
      </div>

      {/* Session */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Session</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <p class="text-white">Current Token</p>
              <p class="text-slate-400 text-sm font-mono">
                {authStore.token?.slice(0, 20)}...
              </p>
            </div>
          </div>

          <button
            class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* About */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">About</h2>
        <div class="space-y-2 text-slate-400">
          <p>FiveM Framework Admin Panel</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
