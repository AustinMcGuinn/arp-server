import { createSignal, createEffect, Show, For, onMount, onCleanup } from "solid-js";

type Tab = "info" | "heritage" | "features" | "appearance" | "clothing";

interface HeadBlend {
  shapeFirst: number;
  shapeSecond: number;
  shapeThird: number;
  skinFirst: number;
  skinSecond: number;
  skinThird: number;
  shapeMix: number;
  skinMix: number;
  thirdMix: number;
}

export default function App() {
  const [isVisible, setIsVisible] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<Tab>("info");
  const [gender, setGender] = createSignal<"male" | "female">("male");

  // Character info
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [dob, setDob] = createSignal("");

  // Appearance data
  const [headBlend, setHeadBlend] = createSignal<HeadBlend>({
    shapeFirst: 0,
    shapeSecond: 0,
    shapeThird: 0,
    skinFirst: 0,
    skinSecond: 0,
    skinThird: 0,
    shapeMix: 0.5,
    skinMix: 0.5,
    thirdMix: 0.0,
  });
  const [faceFeatures, setFaceFeatures] = createSignal<number[]>(Array(20).fill(0));
  const [hairStyle, setHairStyle] = createSignal(0);
  const [hairColor, setHairColor] = createSignal({ primary: 0, secondary: 0 });
  const [eyeColor, setEyeColor] = createSignal(0);

  const handleMessage = (event: MessageEvent) => {
    const { action, data } = event.data;

    switch (action) {
      case "open":
        setIsVisible(true);
        if (data.gender) setGender(data.gender);
        break;
      case "close":
        setIsVisible(false);
        resetForm();
        break;
    }
  };

  onMount(() => {
    window.addEventListener("message", handleMessage);
  });

  onCleanup(() => {
    window.removeEventListener("message", handleMessage);
  });

  const resetForm = () => {
    setActiveTab("info");
    setFirstName("");
    setLastName("");
    setDob("");
    setHeadBlend({
      shapeFirst: 0, shapeSecond: 0, shapeThird: 0,
      skinFirst: 0, skinSecond: 0, skinThird: 0,
      shapeMix: 0.5, skinMix: 0.5, thirdMix: 0.0,
    });
    setFaceFeatures(Array(20).fill(0));
  };

  const fetchNui = async (event: string, data?: Record<string, unknown>) => {
    const resourceName = (window as any).GetParentResourceName?.() ?? "character-creation";
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

  const handleGenderChange = (newGender: "male" | "female") => {
    setGender(newGender);
    fetchNui("setGender", { gender: newGender });
  };

  const updateAppearance = () => {
    fetchNui("updateAppearance", {
      headBlend: headBlend(),
      faceFeatures: faceFeatures(),
      hairColor: hairColor(),
      eyeColor: eyeColor(),
      components: {
        2: { drawable: hairStyle(), texture: 0 },
      },
    });
  };

  const handleSave = () => {
    if (!firstName() || !lastName() || !dob()) {
      return;
    }

    fetchNui("save", {
      firstName: firstName(),
      lastName: lastName(),
      dob: dob(),
      gender: gender(),
      headBlend: headBlend(),
      faceFeatures: faceFeatures(),
      hairColor: hairColor(),
      eyeColor: eyeColor(),
      components: {
        2: { drawable: hairStyle(), texture: 0 },
      },
    });
  };

  const handleCancel = () => {
    fetchNui("cancel");
  };

  const rotateCamera = (direction: "left" | "right") => {
    fetchNui("rotateCamera", { direction });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "info", label: "Info" },
    { id: "heritage", label: "Heritage" },
    { id: "features", label: "Features" },
    { id: "appearance", label: "Appearance" },
    { id: "clothing", label: "Clothing" },
  ];

  const faceFeatureLabels = [
    "Nose Width", "Nose Height", "Nose Length", "Nose Bridge", "Nose Tip",
    "Nose Shift", "Brow Height", "Brow Width", "Cheekbone Height", "Cheekbone Width",
    "Cheek Width", "Eye Size", "Lip Thickness", "Jaw Width", "Jaw Height",
    "Chin Length", "Chin Position", "Chin Width", "Chin Shape", "Neck Width",
  ];

  return (
    <Show when={isVisible()}>
      <div class="w-full h-full flex">
        {/* Left Panel */}
        <div class="w-96 h-full bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md border-r border-slate-700/50 flex flex-col animate-slide-in-left">
          {/* Header */}
          <div class="p-6 border-b border-slate-700/50">
            <h1 class="text-2xl font-bold text-white">Create Character</h1>
            <p class="text-slate-400 text-sm mt-1">Customize your appearance</p>
          </div>

          {/* Tabs */}
          <div class="flex border-b border-slate-700/50">
            <For each={tabs}>
              {(tab) => (
                <button
                  class={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab() === tab.id
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              )}
            </For>
          </div>

          {/* Tab Content */}
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info Tab */}
            <Show when={activeTab() === "info"}>
              <div class="space-y-4">
                {/* Gender Selection */}
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                  <div class="flex gap-3">
                    <button
                      class={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        gender() === "male"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                      onClick={() => handleGenderChange("male")}
                    >
                      Male
                    </button>
                    <button
                      class={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        gender() === "female"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                      onClick={() => handleGenderChange("female")}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName()}
                    onInput={(e) => setFirstName(e.currentTarget.value)}
                    class="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName()}
                    onInput={(e) => setLastName(e.currentTarget.value)}
                    class="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dob()}
                    onInput={(e) => setDob(e.currentTarget.value)}
                    class="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </Show>

            {/* Heritage Tab */}
            <Show when={activeTab() === "heritage"}>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Mother ({headBlend().shapeFirst})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={headBlend().shapeFirst}
                    onInput={(e) => {
                      setHeadBlend({ ...headBlend(), shapeFirst: parseInt(e.currentTarget.value) });
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Father ({headBlend().shapeSecond})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={headBlend().shapeSecond}
                    onInput={(e) => {
                      setHeadBlend({ ...headBlend(), shapeSecond: parseInt(e.currentTarget.value) });
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Shape Mix ({Math.round(headBlend().shapeMix * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={headBlend().shapeMix * 100}
                    onInput={(e) => {
                      setHeadBlend({ ...headBlend(), shapeMix: parseInt(e.currentTarget.value) / 100 });
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Skin Mix ({Math.round(headBlend().skinMix * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={headBlend().skinMix * 100}
                    onInput={(e) => {
                      setHeadBlend({ ...headBlend(), skinMix: parseInt(e.currentTarget.value) / 100 });
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
              </div>
            </Show>

            {/* Features Tab */}
            <Show when={activeTab() === "features"}>
              <div class="space-y-3">
                <For each={faceFeatureLabels}>
                  {(label, index) => (
                    <div>
                      <label class="block text-xs font-medium text-slate-400 mb-1">
                        {label}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={faceFeatures()[index()] * 100}
                        onInput={(e) => {
                          const newFeatures = [...faceFeatures()];
                          newFeatures[index()] = parseInt(e.currentTarget.value) / 100;
                          setFaceFeatures(newFeatures);
                          updateAppearance();
                        }}
                        class="w-full"
                      />
                    </div>
                  )}
                </For>
              </div>
            </Show>

            {/* Appearance Tab */}
            <Show when={activeTab() === "appearance"}>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Hair Style ({hairStyle()})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="36"
                    value={hairStyle()}
                    onInput={(e) => {
                      setHairStyle(parseInt(e.currentTarget.value));
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Hair Color ({hairColor().primary})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="63"
                    value={hairColor().primary}
                    onInput={(e) => {
                      setHairColor({ ...hairColor(), primary: parseInt(e.currentTarget.value) });
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Eye Color ({eyeColor()})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="31"
                    value={eyeColor()}
                    onInput={(e) => {
                      setEyeColor(parseInt(e.currentTarget.value));
                      updateAppearance();
                    }}
                    class="w-full"
                  />
                </div>
              </div>
            </Show>

            {/* Clothing Tab */}
            <Show when={activeTab() === "clothing"}>
              <div class="text-center text-slate-400 py-8">
                <p>Clothing customization</p>
                <p class="text-sm mt-2">Coming soon...</p>
              </div>
            </Show>
          </div>

          {/* Footer */}
          <div class="p-6 border-t border-slate-700/50 space-y-3">
            <button
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!firstName() || !lastName() || !dob()}
            >
              Create Character
            </button>
            <button
              class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Camera Controls */}
        <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            class="w-12 h-12 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => rotateCamera("left")}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            class="w-12 h-12 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => rotateCamera("right")}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
}
