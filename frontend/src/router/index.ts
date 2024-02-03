import {
  createRouter,
  createWebHistory,
  RouteRecordName,
  RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/helpers/users/user";
import {
  routeAccessibleByRole,
  routeAccessibleByAuthenticated,
  routeAccessibleByNotAuthenticated,
} from "@/router/routeAccessManagement";
import { defineAsyncComponent } from "vue";

/* Dinamically import the views */
import HomeView from "@/views/HomeView.vue";
const LandingPage = () => import("@/views/LandingPage.vue");
const AthletesView = () => import("@/views/AthletesView.vue");
const LibraryView = () => import("@/views/LibraryView.vue");
const ProgramView = () => import("@/views/ProgramView.vue");
const ProgramViewerView = () => import("@/views/ProgramViewerView.vue");
const UserLoginView = () => import("@/views/UserLoginView.vue");
const UserRegisterView = () => import("@/views/UserRegisterView.vue");
const UserProfileView = () => import("@/views/UserProfileView.vue");
const PageNotFoundView = () => import("@/views/PageNotFoundView.vue");
const PrivacyPolicyView = () => import("@/views/PrivacyPolicyView.vue");
const CookiePolicyView = () => import("@/views/CookiePolicyView.vue");
const TermsAndConditionView = () =>
  import("@/views/TermsAndConditionsView.vue");

/* Define components that will be passed to routes */
const RightDrawerProgramElements = defineAsyncComponent(
  () => import("@/components/layout/RightDrawerProgramElements.vue"),
);

/* Set routes names */
export enum NamedRoutes {
  home = "home",
  access = "access",
  athletes = "athletes",
  library = "library",
  program = "program",
  view = "view",
  view_program = "program_view",
  login = "login",
  register = "register",
  profile = "profile",
  privacy_policy = "privacy_policy",
  cookie_policy = "cookie_policy",
  terms_conditions = "terms_conditions",
  not_found = "not_found",
}

/**
 * Currently available meta info in routes:
 *  - title : To set the page title in browser.
 *  - showHeader: If true, show top header. Default is true.
 *  - showFooter: If true, show bottom footer. Default is true.
 *  - showLeftDrawer: If true, show left drawer. Default is true.
 *  - showRightDrawer: If false, do not show right drawer. If a component is provided, use
 *                     it as right drawer. The default is false.
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

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: NamedRoutes.home,
    component: HomeView,
    meta: {
      title: "Home",
      redirectNotAuthenticated: "access",
    },
  },
  {
    path: "/access",
    name: NamedRoutes.home,
    component: LandingPage,
    meta: {
      title: "Access",
      showLeftDrawer: false,
      showHeader: false,
    },
  },
  {
    path: "/athletes",
    name: NamedRoutes.athletes,
    component: AthletesView,
    meta: {
      title: "Athletes",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
    },
  },
  {
    path: "/library",
    name: NamedRoutes.library,
    component: LibraryView,
    meta: {
      title: "Library",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
    },
  },
  {
    path: "/program/:programId?",
    name: NamedRoutes.program,
    component: ProgramView,
    meta: {
      title: "Program",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
      showRightDrawer: RightDrawerProgramElements,
    },
  },
  {
    path: "/view",
    name: NamedRoutes.view,
    meta: {
      title: "View",
      showHeader: false,
      showFooter: true,
      showLeftDrawer: false,
    },
    children: [
      {
        path: "program",
        name: NamedRoutes.view_program,
        component: ProgramViewerView,
        meta: {
          title: "View program",
        },
      },
    ],
  },
  {
    path: "/login",
    name: NamedRoutes.login,
    component: UserLoginView,
    props: true,
    meta: {
      title: "Login",
      redirectAuthenticated: "home",
    },
  },
  {
    path: "/register",
    name: NamedRoutes.register,
    component: UserRegisterView,
    meta: {
      title: "Register",
      redirectAuthenticated: "home",
      redirectNotAuthenticated: "login",
    },
  },
  {
    path: "/profile",
    name: NamedRoutes.profile,
    component: UserProfileView,
    meta: {
      title: "Profile",
      redirectNotAuthenticated: "login",
    },
  },
  {
    path: "/privacy-policy",
    name: NamedRoutes.privacy_policy,
    component: PrivacyPolicyView,
    meta: {
      title: "Privacy Policy",
    },
  },
  {
    path: "/cookie-policy",
    name: NamedRoutes.cookie_policy,
    component: CookiePolicyView,
    meta: {
      title: "Cookie Policy",
    },
  },
  {
    path: "/terms-and-conditions",
    name: NamedRoutes.terms_conditions,
    component: TermsAndConditionView,
    meta: {
      title: "Terms and Conditions",
    },
  },
  {
    // page not found
    path: "/:pathMatch(.*)*",
    name: NamedRoutes.not_found,
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
    (to.meta.title ? to.meta.title + " - " : "") + "OpenStrength";
});

export default router;
