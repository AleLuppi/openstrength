import { boot } from "quasar/wrappers";
import type { RouteRecordName } from "vue-router";
import { NamedRoutes } from "@/router";
import { useUserStore } from "@/stores/user";
import {
  routeAccessibleByRole,
  routeAccessibleByLevel,
  routeAccessibleByAuthenticated,
  routeAccessibleByNotAuthenticated,
} from "@/router/routeAccessManagement";

export default boot(async ({ router, store }) => {
  /* Optional redirects */
  router.beforeEach(async (to) => {
    const user = useUserStore(store);

    // Check if user has the authorization to access the page
    if (!routeAccessibleByRole(user, to) || !routeAccessibleByLevel(user, to)) {
      // Redirect user
      return {
        name: (to.meta.redirectNotAuthorized ??
          NamedRoutes.notFound) as RouteRecordName,
      };
      // TODO redirect to a "restricted access" page if redirectNotAuthorized is unknown
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
  router.afterEach((to) => {
    document.title =
      (to.meta.title ? to.meta.title + " - " : "") + process.env.VITE_APP_NAME;
  });
});
