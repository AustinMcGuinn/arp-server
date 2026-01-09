import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { login } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [token, setToken] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In production, you'd validate the token with the server
      // For now, we just store it and let WebSocket handle validation
      if (token().length < 10) {
        throw new Error("Invalid token format");
      }

      login(token(), ["admin"]);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div class="w-full max-w-md">
        {/* Logo */}
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">FiveM Admin</h1>
          <p class="text-slate-400">Server Management Panel</p>
        </div>

        {/* Login Form */}
        <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-8">
          <h2 class="text-xl font-semibold text-white mb-6">Login</h2>

          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={token()}
                onInput={(e) => setToken(e.currentTarget.value)}
                class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                placeholder="Enter your API token"
                required
              />
            </div>

            {error() && (
              <div class="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading()}
              class="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading() ? "Connecting..." : "Connect"}
            </button>
          </form>

          <p class="text-slate-500 text-sm text-center mt-6">
            Need a token? Contact your server administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
