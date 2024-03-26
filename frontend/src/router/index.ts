import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import routes, { NamedRoutes } from "./routes";
export { NamedRoutes };

/*
 * If not building with SSR mode, it is possible
 * to directly export the Router instantiation;
 *
 * The function below can be async too (use async
 * or return a Promise).
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Do not change this, modify quasar config if needed
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  return Router;
});
