import { createSignal, createEffect, For, onCleanup, Show } from "solid-js";
import { useWebSocket } from "../lib/websocket";

interface Player {
  source: number;
  name: string;
  identifiers: {
    license: string;
    discord?: string;
  };
  character: {
    id: number;
    name: string;
    job: string;
    cash: number;
    bank: number;
  } | null;
}

export default function Players() {
  const { send, subscribe } = useWebSocket();
  const [players, setPlayers] = createSignal<Player[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [selectedPlayer, setSelectedPlayer] = createSignal<Player | null>(null);

  createEffect(() => {
    // Request players list
    send("getPlayers", {});
    setLoading(true);

    const unsub = subscribe("players", (data: any) => {
      setPlayers(data.players);
      setLoading(false);
    });

    onCleanup(unsub);
  });

  const handleKick = (player: Player) => {
    const reason = prompt("Enter kick reason:");
    if (reason) {
      send("kickPlayer", { source: player.source, reason });
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white">Players</h1>
          <p class="text-slate-400 mt-1">Manage online players</p>
        </div>
        <button
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          onClick={() => send("getPlayers", {})}
        >
          Refresh
        </button>
      </div>

      {/* Players Table */}
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <Show
          when={!loading()}
          fallback={
            <div class="p-8 text-center text-slate-400">Loading players...</div>
          }
        >
          <Show
            when={players().length > 0}
            fallback={
              <div class="p-8 text-center text-slate-400">No players online</div>
            }
          >
            <table class="w-full">
              <thead class="bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-medium text-slate-400">ID</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-slate-400">Name</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-slate-400">Character</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-slate-400">Job</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-slate-400">Money</th>
                  <th class="px-6 py-4 text-right text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <For each={players()}>
                  {(player) => (
                    <tr class="hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-300">{player.source}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-white font-medium">{player.name}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-slate-300">
                          {player.character?.name || "—"}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-slate-300">
                          {player.character?.job || "—"}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <Show when={player.character}>
                          <div class="text-sm">
                            <span class="text-green-400">
                              {formatMoney(player.character!.cash)}
                            </span>
                            <span class="text-slate-500 mx-1">/</span>
                            <span class="text-blue-400">
                              {formatMoney(player.character!.bank)}
                            </span>
                          </div>
                        </Show>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <button
                          class="px-3 py-1 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition-colors"
                          onClick={() => handleKick(player)}
                        >
                          Kick
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </Show>
      </div>
    </div>
  );
}
