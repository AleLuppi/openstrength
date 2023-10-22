import { UserProps, UserRole } from "@/helpers/users/user";

/**
 * Check if route can be accessed by user, according to user role.
 *
 * @param user instance requiring access.
 * @param route route that shall be accessed.
 * @returns true if user can access, false otherwise.
 */
export function routeAccessibleByRole(
  user: UserProps,
  route: { [key: string]: any; meta: { [key: string]: any } },
) {
  // Check whether access should be restricted
  const restrictIf =
    route.meta.restrictAccessByRole && // explicit restriction
    (!user.role || // user is not logged is or role is unknown
      !(route.meta.restrictAccessByRole as UserRole[])
        .concat([UserRole.admin])
        .includes(user.role)); // user role is not allowed
  return !restrictIf;
}

/**
 * Check if route can be accessed by user, according to user login state.
 *
 * @param user instance requiring access.
 * @param route route that shall be accessed.
 * @returns true if user can access, false otherwise.
 */
export function routeAccessibleByAuthenticated(
  user: UserProps,
  route: { [key: string]: any; meta: { [key: string]: any } },
) {
  // Check whether access should be restricted
  const restrictIf =
    user.isSignedIn &&
    route.meta.redirectAuthenticated &&
    route.name !== route.meta.redirectAuthenticated;
  return !restrictIf;
}

/**
 * Check if route can be accessed by user, according to user login state.
 *
 * @param user instance requiring access.
 * @param route route that shall be accessed.
 * @returns true if user can access, false otherwise.
 */
export function routeAccessibleByNotAuthenticated(
  user: UserProps,
  route: { [key: string]: any; meta: { [key: string]: any } },
) {
  // Check whether access should be restricted
  const restrictIf =
    !user.isSignedIn &&
    route.meta.redirectNotAuthenticated &&
    route.name !== route.meta.redirectNotAuthenticated;
  return !restrictIf;
}

/**
 * Check if route can be accessed by user.
 *
 * @param user instance requiring access.
 * @param route route that shall be accessed.
 * @returns true if user can access, false otherwise.
 */
export function routeAccessibleByUser(
  user: UserProps,
  route: { [key: string]: any; meta: { [key: string]: any } },
) {
  // Check if user can access, according to all restricting rules
  return (
    routeAccessibleByRole(user, route) &&
    routeAccessibleByAuthenticated(user, route) &&
    routeAccessibleByNotAuthenticated(user, route)
  );
}
