import { createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";

interface InventoryItem {
  slot: number;
  name: string;
  label: string;
  count: number;
  weight: number;
  metadata: Record<string, unknown>;
  image: string;
}

interface Inventory {
  id: string;
  type: string;
  label: string;
  slots: number;
  maxWeight: number;
  items: InventoryItem[];
}

interface InventoryData {
  primary: Inventory;
  secondary?: Inventory;
}

export default function App() {
  const [isVisible, setIsVisible] = createSignal(false);
  const [inventory, setInventory] = createSignal<InventoryData | null>(null);
  const [dragItem, setDragItem] = createSignal<{ inventory: string; slot: number } | null>(null);
  const [contextMenu, setContextMenu] = createSignal<{ x: number; y: number; slot: number } | null>(null);

  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;

    switch (action) {
      case "open":
        setInventory(data);
        setIsVisible(true);
        break;
      case "close":
        setIsVisible(false);
        setInventory(null);
        setContextMenu(null);
        break;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isVisible()) {
      closeInventory();
    }
  };

  onMount(() => {
    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("message", handleMessage);
    window.removeEventListener("keydown", handleKeyDown);
  });

  const fetchNui = async (event: string, data?: Record<string, unknown>) => {
    const resourceName = (window as any).GetParentResourceName?.() ?? "inventory";
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

  const closeInventory = () => {
    fetchNui("closeInventory");
  };

  const handleDragStart = (inventoryId: string, slot: number) => {
    setDragItem({ inventory: inventoryId, slot });
  };

  const handleDragEnd = () => {
    setDragItem(null);
  };

  const handleDrop = (toInventoryId: string, toSlot: number) => {
    const from = dragItem();
    if (!from) return;

    const inv = inventory();
    if (!inv) return;

    const fromInv = from.inventory === inv.primary.id ? inv.primary : inv.secondary;
    const fromItem = fromInv?.items.find((i) => i.slot === from.slot);

    if (fromItem) {
      fetchNui("moveItem", {
        fromInventory: from.inventory,
        toInventory: toInventoryId,
        fromSlot: from.slot,
        toSlot,
        count: fromItem.count,
      });
    }

    setDragItem(null);
  };

  const handleUseItem = (slot: number) => {
    fetchNui("useItem", { slot });
    setContextMenu(null);
  };

  const handleContextMenu = (e: MouseEvent, slot: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, slot });
  };

  const calculateWeight = (items: InventoryItem[]): number => {
    return items.reduce((total, item) => total + item.weight * item.count, 0);
  };

  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  };

  const renderSlots = (inv: Inventory) => {
    const slots = Array.from({ length: inv.slots }, (_, i) => i + 1);

    return (
      <div class="grid grid-cols-8 gap-2 p-4">
        <For each={slots}>
          {(slotNum) => {
            const item = () => inv.items.find((i) => i.slot === slotNum);

            return (
              <div
                class={`item-slot aspect-square flex flex-col items-center justify-center cursor-pointer ${
                  dragItem()?.inventory === inv.id && dragItem()?.slot === slotNum ? "dragging" : ""
                }`}
                draggable={!!item()}
                onDragStart={() => item() && handleDragStart(inv.id, slotNum)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(inv.id, slotNum)}
                onContextMenu={(e) => item() && handleContextMenu(e, slotNum)}
                onDblClick={() => item() && handleUseItem(slotNum)}
              >
                <Show when={item()}>
                  <div class="w-full h-full p-1 flex flex-col">
                    {/* Item image placeholder */}
                    <div class="flex-1 flex items-center justify-center">
                      <div class="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                        <span class="text-xs text-slate-400 text-center">
                          {item()!.label.slice(0, 4)}
                        </span>
                      </div>
                    </div>
                    {/* Item label and count */}
                    <div class="text-center">
                      <p class="text-xs text-white truncate">{item()!.label}</p>
                      <p class="text-xs text-slate-400">x{item()!.count}</p>
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    );
  };

  return (
    <Show when={isVisible() && inventory()}>
      <div class="w-full h-full flex items-center justify-center p-8" onClick={() => setContextMenu(null)}>
        <div class="flex gap-4">
          {/* Primary Inventory */}
          <div class="w-[500px] bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div class="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h2 class="text-lg font-bold text-white">{inventory()!.primary.label}</h2>
                <p class="text-sm text-slate-400">
                  {formatWeight(calculateWeight(inventory()!.primary.items))} /{" "}
                  {formatWeight(inventory()!.primary.maxWeight)}
                </p>
              </div>
              <button
                class="p-2 text-slate-400 hover:text-white transition-colors"
                onClick={closeInventory}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Weight bar */}
            <div class="px-4 py-2">
              <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (calculateWeight(inventory()!.primary.items) / inventory()!.primary.maxWeight) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Slots */}
            {renderSlots(inventory()!.primary)}
          </div>

          {/* Secondary Inventory (if exists) */}
          <Show when={inventory()?.secondary}>
            <div class="w-[500px] bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
              <div class="p-4 border-b border-slate-700/50">
                <h2 class="text-lg font-bold text-white">{inventory()!.secondary!.label}</h2>
                <p class="text-sm text-slate-400">
                  {formatWeight(calculateWeight(inventory()!.secondary!.items))} /{" "}
                  {formatWeight(inventory()!.secondary!.maxWeight)}
                </p>
              </div>
              <div class="px-4 py-2">
                <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (calculateWeight(inventory()!.secondary!.items) / inventory()!.secondary!.maxWeight) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              {renderSlots(inventory()!.secondary!)}
            </div>
          </Show>
        </div>

        {/* Context Menu */}
        <Show when={contextMenu()}>
          <div
            class="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50"
            style={{ left: `${contextMenu()!.x}px`, top: `${contextMenu()!.y}px` }}
          >
            <button
              class="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800 transition-colors"
              onClick={() => handleUseItem(contextMenu()!.slot)}
            >
              Use
            </button>
            <button
              class="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800 transition-colors"
              onClick={() => setContextMenu(null)}
            >
              Drop
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}
