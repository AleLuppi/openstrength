import "vue-router";
import type { UserRole } from "src/helpers/users/user";
import type { NamedRoutes } from "./routes";

declare module "vue-router" {
  interface RouteMeta {
    // Page title in browser
    title?: string;

    // List of user roles that can access the page (Admin is always included)
    // If not provided, anyone can access the page
    restrictAccessByRole?: UserRole[];

    // Maximum access level number user must have to be able to access the page
    // (e.g. if 3, only users with level 1, 2 or 3 can access)
    restrictAccessToLevel?: 1 | 2 | 3 | 4 | 5;

    //View to redirect user when trying to access a view that is restricted by user role
    redirectNotAuthorized?: NamedRoutes;

    // View to redirect user if authenticated
    // This is a special restriction by role where no role can access a page
    redirectAuthenticated?: NamedRoutes;

    // View to redirect user if not authenticated
    // This is a special restriction by role where any role can access, if role is defined
    redirectNotAuthenticated?: NamedRoutes;
  }
}
