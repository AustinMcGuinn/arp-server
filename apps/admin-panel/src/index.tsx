/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./index.css";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

const root = document.getElementById("root");

render(
  () => (
    <Router root={App}>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/players" component={Players} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/settings" component={Settings} />
    </Router>
  ),
  root!
);
