const RESOURCE_NAME = GetCurrentResourceName();

let isOpen = false;

console.log(`[${RESOURCE_NAME}] Starting Inventory System (Client)...`);

// Open inventory
function openInventory(): void {
  if (isOpen) return;

  emitNet("inventory:open");
}

// Close inventory
function closeInventory(): void {
  if (!isOpen) return;

  isOpen = false;
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: "close",
    data: {},
  });
}

// Keybind to open inventory
RegisterCommand(
  "inventory",
  () => {
    openInventory();
  },
  false
);

RegisterKeyMapping("inventory", "Open Inventory", "keyboard", "TAB");

// Event handlers
onNet("inventory:openNui", (data: any) => {
  isOpen = true;
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: "open",
    data,
  });
});

onNet("inventory:closeNui", () => {
  closeInventory();
});

onNet("inventory:refresh", () => {
  if (isOpen) {
    emitNet("inventory:open");
  }
});

// NUI Callbacks
RegisterNuiCallbackType("moveItem");
on("__cfx_nui:moveItem", (data: any, cb: (result: unknown) => void) => {
  emitNet("inventory:moveItem", data);
  cb({ success: true });
});

RegisterNuiCallbackType("useItem");
on("__cfx_nui:useItem", (data: { slot: number }, cb: (result: unknown) => void) => {
  emitNet("inventory:useItem", data.slot);
  cb({ success: true });
});

RegisterNuiCallbackType("closeInventory");
on("__cfx_nui:closeInventory", (_data: unknown, cb: (result: unknown) => void) => {
  closeInventory();
  emitNet("inventory:close");
  cb({ success: true });
});

// Use item callback for other resources
on("inventory:itemUsed", (itemData: any) => {
  // Handle client-side item use effects
  const itemName = itemData.name;

  switch (itemName) {
    case "burger":
    case "water":
      // Could play eating animation here
      break;
    case "bandage":
    case "medikit":
      // Could play healing animation here
      break;
  }
});

console.log(`[${RESOURCE_NAME}] Inventory System (Client) loaded!`);
