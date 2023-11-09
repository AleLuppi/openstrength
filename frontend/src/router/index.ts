import { createRouter, createWebHistory, RouteRecordName } from "vue-router";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/helpers/users/user";
import {
  routeAccessibleByRole,
  routeAccessibleByAuthenticated,
  routeAccessibleByNotAuthenticated,
} from "@/router/routeAccessManagement";

/* (dinamically) import the views */
import HomeView from "../views/HomeView.vue";
const AthletesView = () => import("@/views/AthletesView.vue");
const LibraryView = () => import("@/views/LibraryView.vue");
const ProgramView = () => import("@/views/ProgramView.vue");
const UserLoginView = () => import("@/views/UserLoginView.vue");
const UserRegisterView = () => import("@/views/UserRegisterView.vue");
const UserProfileView = () => import("@/views/UserProfileView.vue");
const PageNotFoundView = () => import("@/views/PageNotFoundView.vue");
const PrivacyPolicyView = () => import("@/views/PrivacyPolicyView.vue");
const CookiePolicyView = () => import("@/views/CookiePolicyView.vue");
const TermsAndConditionView = () =>
  import("@/views/TermsAndConditionsView.vue");

/**
 * Currently available meta info in routes:
 *  - title : To set the page title in browser.
 *  - showHeader: If true, show top header. Default is true.
 *  - showFooter: If true, show bottom footer. Default is true.
 *  - restrictAccessByRole : List of user roles that can access the page. If not provided,
 *                           anyone can access the page. Admin can always access.
 *  - redirectNotAuthorized : View to redirect user when trying to access a view that is
 *                            restricted by user role.
 *  - redirectAuthenticated : View to redirect user if authenticated. This is a special
 *                            restriction by role where no role can access a page.
 *  - redirectNotAuthenticated : View to redirect user if not authenticated. This is a special
 *                               restriction by role where any role can access, if role is
 *                               defined.
 */

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "Home",
    },
  },
  {
    path: "/athletes",
    name: "athletes",
    component: AthletesView,
    meta: {
      title: "Athletes",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
    },
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: {
      title: "Library",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
    },
  },
  {
    path: "/program",
    name: "program",
    component: ProgramView,
    meta: {
      title: "Program",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
      showRightDrawer: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: UserLoginView,
    props: true,
    meta: {
      title: "Login",
      redirectAuthenticated: "home",
    },
  },
  {
    path: "/register",
    name: "register",
    component: UserRegisterView,
    meta: {
      title: "Register",
      redirectAuthenticated: "home",
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: UserProfileView,
    meta: {
      title: "Profile",
      redirectNotAuthenticated: "login",
    },
  },
  {
    path: "/privacy-policy",
    name: "privacy_policy",
    component: PrivacyPolicyView,
    meta: {
      title: "Privacy Policy",
    },
  },
  {
    path: "/cookie-policy",
    name: "cookie_policy",
    component: CookiePolicyView,
    meta: {
      title: "Cookie Policy",
    },
  },
  {
    path: "/terms-and-conditions",
    name: "terms_conditions",
    component: TermsAndConditionView,
    meta: {
      title: "Terms and Conditions",
    },
  },
  {
    // page not found
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: PageNotFoundView,
    meta: {
      title: "Page not found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

/* Optional redirects */
router.beforeEach(async (to) => {
  const user = useUserStore();

  // Check if user has the authorization to access the page
  if (!routeAccessibleByRole(user, to)) {
    // Redirect user
    return {
      name: (to.meta.redirectNotAuthorized ?? "not_found") as RouteRecordName,
    };
    // FIXME redirect to a "restriced access" page if redirectNotAuthorized is unknown
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
    (to.meta.title ? to.meta.title + " - " : "") + "OpenStrength"; // TODO + app name
});

export default router;
