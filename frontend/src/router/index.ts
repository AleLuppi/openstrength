import { route } from "quasar/wrappers";
import {
  RouteRecordName,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  routeAccessibleByRole,
  routeAccessibleByLevel,
  routeAccessibleByAuthenticated,
  routeAccessibleByNotAuthenticated,
} from "@/router/routeAccessManagement";

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

  /* Optional redirects */
  Router.beforeEach(async (to) => {
    const user = useUserStore();

    // Check if user has the authorization to access the page
    if (!routeAccessibleByRole(user, to) || !routeAccessibleByLevel(user, to)) {
      // Redirect user
      return {
        name: (to.meta.redirectNotAuthorized ??
          NamedRoutes.notFound) as RouteRecordName,
      };
      // TODO redirect to a "restriced access" page if redirectNotAuthorized is unknown
    }

    // Check if authenticated user needs to be redirected
    if (!routeAccessibleByAuthenticated(user, to)) {
      // Redirect user
      return { name: to.meta.redirectAuthenticated as RouteRecordName };
    }

    // Check if not authenticated user needs to be redirected
    if (!routeAccessibleByNotAuthenticated(user, to)) {
      // Redirect user
      return { name: to.meta.redirectNotAuthenticated as RouteRecordName };
    }
  });

  /* Set the page title */
  Router.afterEach((to) => {
    document.title =
      (to.meta.title ? to.meta.title + " - " : "") + process.env.VITE_APP_NAME;
  });

  return Router;
});
