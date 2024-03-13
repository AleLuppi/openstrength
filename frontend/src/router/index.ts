import {
  createRouter,
  createWebHistory,
  RouteRecordName,
  RouteRecordRaw,
} from "vue-router";
import { inject } from "vue";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/helpers/users/user";
import {
  routeAccessibleByRole,
  routeAccessibleByLevel,
  routeAccessibleByAuthenticated,
  routeAccessibleByNotAuthenticated,
} from "@/router/routeAccessManagement";
import { defineAsyncComponent } from "vue";

/* Dinamically import the views */
import HomeView from "@/views/HomeView.vue";
import { Config } from "@/boot/config";
const LandingPage = () => import("@/views/LandingPage.vue");
const LandingConfirmationPage = () =>
  import("@/views/LandingConfirmationPage.vue");
const AthletesView = () => import("@/views/AthletesView.vue");
const LibraryView = () => import("@/views/LibraryView.vue");
const ProgramView = () => import("@/views/ProgramView.vue");
const ProgramViewerView = () => import("@/views/ProgramViewerView.vue");
const ProgramLibraryView = () => import("@/views/ProgramLibraryView.vue");
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
  landing = "landing",
  landingConfirmation = "landingConfirmation",
  athletes = "athletes",
  exerciseLibrary = "exerciseLibrary",
  program = "program",
  programLibrary = "programLibrary",
  view = "view",
  viewProgram = "viewProgram",
  login = "login",
  register = "register",
  profile = "profile",
  privacyPolicy = "privacyPolicy",
  cookiePolicy = "cookiePolicy",
  termsConditions = "termsConditions",
  notFound = "notFound",
}

/**
 * Currently available meta info in routes:
 *  - title : To set the page title in browser.
 *  - showHeader: Set both header-related meta properties:
 *    - showHeaderSm: If true, show header on small screens. Default is true.
 *    - showHeaderLg: If true, show header on large screens. Default is false.
 *  - showFooter: If true, show bottom footer. Default is true.
 *  - showLeftDrawer: If true, show left drawer. Default is true.
 *  - showRightDrawer: If false, do not show right drawer. If a component is provided, use
 *                     it as right drawer. The default is false.
 *  - restrictAccessByRole : List of user roles that can access the page. If not provided,
 *                           anyone can access the page. Admin can always access.
 *  - restrictAccessToLevel : Maximum access level number user must have to be able to access
 *                            the page (eg if 3, only users with level 1, 2 or 3 can access).
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
      restrictAccessToLevel: 4,
      redirectNotAuthorized: NamedRoutes.landing,
      redirectNotAuthenticated: NamedRoutes.landing,
    },
  },
  {
    path: "/welcome",
    name: NamedRoutes.landing,
    component: LandingPage,
    meta: {
      title: "Welcome",
      showHeader: true,
      showLeftDrawer: false,
    },
  },
  {
    path: "/confirmation",
    name: NamedRoutes.landingConfirmation,
    component: LandingConfirmationPage,
    meta: {
      title: "Welcome",
      showHeader: true,
      showLeftDrawer: false,
    },
  },
  {
    path: "/athletes",
    name: NamedRoutes.athletes,
    component: AthletesView,
    meta: {
      title: "Athletes",
      restrictAccessByRole: [UserRole.coach],
      restrictAccessToLevel: 4,
      redirectNotAuthorized: NamedRoutes.home,
    },
  },
  {
    path: "/library",
    name: NamedRoutes.exerciseLibrary,
    component: LibraryView,
    meta: {
      title: "Library",
      restrictAccessByRole: [UserRole.coach],
      restrictAccessToLevel: 4,
      redirectNotAuthorized: NamedRoutes.home,
    },
  },
  {
    path: "/program/:programId?",
    name: NamedRoutes.program,
    component: ProgramView,
    meta: {
      title: "Program",
      restrictAccessByRole: [UserRole.coach],
      restrictAccessToLevel: 4,
      redirectNotAuthorized: NamedRoutes.home,
      showRightDrawer: RightDrawerProgramElements,
    },
  },
  {
    path: "/program-library",
    name: NamedRoutes.programLibrary,
    component: ProgramLibraryView,
    meta: {
      title: "Program Library",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
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
        name: NamedRoutes.viewProgram,
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
      redirectAuthenticated: NamedRoutes.home,
    },
  },
  {
    path: "/register",
    name: NamedRoutes.register,
    component: UserRegisterView,
    meta: {
      title: "Register",
      redirectAuthenticated: NamedRoutes.home,
    },
  },
  {
    path: "/profile",
    name: NamedRoutes.profile,
    component: UserProfileView,
    meta: {
      title: "Profile",
      redirectNotAuthenticated: NamedRoutes.login,
    },
  },
  {
    path: "/privacy-policy",
    name: NamedRoutes.privacyPolicy,
    component: PrivacyPolicyView,
    meta: {
      title: "Privacy Policy",
    },
  },
  {
    path: "/cookie-policy",
    name: NamedRoutes.cookiePolicy,
    component: CookiePolicyView,
    meta: {
      title: "Cookie Policy",
    },
  },
  {
    path: "/terms-and-conditions",
    name: NamedRoutes.termsConditions,
    component: TermsAndConditionView,
    meta: {
      title: "Terms and Conditions",
    },
  },
  {
    // page not found
    path: "/:pathMatch(.*)*",
    name: NamedRoutes.notFound,
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
router.afterEach((to) => {
  document.title =
    (to.meta.title ? to.meta.title + " - " : "") +
    (inject("$appProperties") as Config["$appProperties"]).name;
});

export default router;
