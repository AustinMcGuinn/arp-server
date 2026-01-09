import { createStore } from "solid-js/store";

interface AuthState {
  token: string | null;
  permissions: string[];
}

const storedToken = localStorage.getItem("admin_token");

const [authStore, setAuthStore] = createStore<AuthState>({
  token: storedToken,
  permissions: [],
});

export function login(token: string, permissions: string[] = []): void {
  localStorage.setItem("admin_token", token);
  setAuthStore({ token, permissions });
}

export function logout(): void {
  localStorage.removeItem("admin_token");
  setAuthStore({ token: null, permissions: [] });
}

export function hasPermission(permission: string): boolean {
  return authStore.permissions.includes(permission) || authStore.permissions.includes("admin");
}

export { authStore };
