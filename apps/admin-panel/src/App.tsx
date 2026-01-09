import { type ParentComponent, createEffect, Show } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import Sidebar from "./components/Sidebar";
import { useWebSocket } from "./lib/websocket";
import { authStore } from "./lib/auth";

const App: ParentComponent = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, connect } = useWebSocket();

  createEffect(() => {
    // Redirect to login if not authenticated
    if (!authStore.token && location.pathname !== "/login") {
      navigate("/login");
    }

    // Connect WebSocket when authenticated
    if (authStore.token && !isConnected()) {
      connect();
    }
  });

  const isLoginPage = () => location.pathname === "/login";

  return (
    <div class="min-h-screen bg-slate-950">
      <Show when={!isLoginPage()} fallback={props.children}>
        <div class="flex">
          <Sidebar />
          <main class="flex-1 ml-64 p-8">{props.children}</main>
        </div>
      </Show>
    </div>
  );
};

export default App;
