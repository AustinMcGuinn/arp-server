import { createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";

interface Character {
  id: number;
  firstName: string;
  lastName: string;
  job: string;
  jobGrade: string;
  cash: number;
  bank: number;
  lastPlayed: string;
}

interface CharacterData {
  characters: Character[];
  maxCharacters: number;
}

export default function App() {
  const [isVisible, setIsVisible] = createSignal(false);
  const [characters, setCharacters] = createSignal<Character[]>([]);
  const [maxCharacters, setMaxCharacters] = createSignal(5);
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = createSignal<number | null>(null);

  // NUI message handler
  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;

    switch (action) {
      case "open":
        setIsVisible(true);
        break;
      case "close":
        setIsVisible(false);
        setSelectedId(null);
        setDeleteConfirm(null);
        break;
      case "setCharacters":
        setCharacters(data.characters);
        setMaxCharacters(data.maxCharacters);
        break;
    }
  };

  onMount(() => {
    window.addEventListener("message", handleMessage);
  });

  onCleanup(() => {
    window.removeEventListener("message", handleMessage);
  });

  const fetchNui = async (event: string, data?: Record<string, unknown>) => {
    const resourceName = (window as any).GetParentResourceName?.() ?? "character-selection";
    try {
      await fetch(`https://${resourceName}/${event}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data ?? {}),
      });
    } catch (e) {
      console.error("NUI fetch error:", e);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handlePlay = () => {
    const id = selectedId();
    if (id) {
      fetchNui("selectCharacter", { id });
    }
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm() === id) {
      fetchNui("deleteCharacter", { id });
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleCreate = () => {
    fetchNui("createNew");
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Show when={isVisible()}>
      <div class="w-full h-full flex items-center justify-center p-8 animate-fade-in">
        {/* Main container */}
        <div class="w-full max-w-6xl">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-5xl font-bold text-white tracking-wider drop-shadow-lg">
              SELECT CHARACTER
            </h1>
            <p class="text-primary-400 mt-2 text-lg">
              Choose your character to begin your journey
            </p>
          </div>

          {/* Character Grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <For each={characters()}>
              {(char, index) => (
                <div
                  class={`group relative cursor-pointer transition-all duration-300 animate-slide-up ${
                    selectedId() === char.id
                      ? "scale-105"
                      : "hover:scale-102"
                  }`}
                  style={{ "animation-delay": `${index() * 100}ms` }}
                  onClick={() => handleSelect(char.id)}
                >
                  {/* Card */}
                  <div
                    class={`relative overflow-hidden rounded-xl backdrop-blur-md border-2 transition-all duration-300 ${
                      selectedId() === char.id
                        ? "bg-primary-900/40 border-primary-500 shadow-lg shadow-primary-500/20"
                        : "bg-slate-900/60 border-slate-700/50 hover:border-primary-500/50"
                    }`}
                  >
                    {/* Glow effect */}
                    <div
                      class={`absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 transition-opacity ${
                        selectedId() === char.id ? "opacity-100" : "group-hover:opacity-50"
                      }`}
                    />

                    {/* Content */}
                    <div class="relative p-6">
                      {/* Name */}
                      <h3 class="text-2xl font-bold text-white mb-1">
                        {char.firstName} {char.lastName}
                      </h3>

                      {/* Job */}
                      <p class="text-primary-400 text-sm font-medium uppercase tracking-wide mb-4">
                        {char.job}
                      </p>

                      {/* Stats */}
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-slate-400">Cash</span>
                          <span class="text-green-400 font-medium">{formatMoney(char.cash)}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">Bank</span>
                          <span class="text-blue-400 font-medium">{formatMoney(char.bank)}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">Last Played</span>
                          <span class="text-slate-300">{formatDate(char.lastPlayed)}</span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        class={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                          deleteConfirm() === char.id
                            ? "bg-red-500 text-white"
                            : "bg-slate-800/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(char.id);
                        }}
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Selected indicator */}
                    <Show when={selectedId() === char.id}>
                      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
                    </Show>
                  </div>
                </div>
              )}
            </For>

            {/* Create New Character Card */}
            <Show when={characters().length < maxCharacters()}>
              <div
                class="group cursor-pointer transition-all duration-300 hover:scale-102 animate-slide-up"
                style={{ "animation-delay": `${characters().length * 100}ms` }}
                onClick={handleCreate}
              >
                <div class="h-full min-h-[200px] flex flex-col items-center justify-center rounded-xl backdrop-blur-md bg-slate-900/40 border-2 border-dashed border-slate-600 hover:border-primary-500/50 transition-colors">
                  <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary-900/50 transition-colors">
                    <svg
                      class="w-8 h-8 text-slate-400 group-hover:text-primary-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <span class="text-slate-400 font-medium group-hover:text-primary-400 transition-colors">
                    Create New Character
                  </span>
                  <span class="text-slate-500 text-sm mt-1">
                    {characters().length}/{maxCharacters()} slots used
                  </span>
                </div>
              </div>
            </Show>
          </div>

          {/* Play Button */}
          <Show when={selectedId()}>
            <div class="flex justify-center animate-slide-up">
              <button
                class="px-12 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-xl font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-105 hover:shadow-primary-500/50"
                onClick={handlePlay}
              >
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  PLAY
                </div>
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
