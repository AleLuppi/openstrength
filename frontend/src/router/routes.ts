import { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/helpers/users/user";

/* Dinamically import the layouts */
const MainLayout = () => import("layouts/MainLayout.vue");
const ExternalLayout = () => import("layouts/ExternalLayout.vue");
const EmptyLayout = () => import("layouts/EmptyLayout.vue");

/* Dinamically import the pages */
const HomePage = () => import("pages/HomePage.vue");
const LandingPage = () => import("pages/LandingPage.vue");
const LandingConfirmationPage = () =>
  import("pages/LandingConfirmationPage.vue");
const AthletesPage = () => import("pages/AthletesPage.vue");
const LibraryPage = () => import("pages/LibraryPage.vue");
const ProgramBuilderPage = () => import("pages/ProgramBuilderPage.vue");
const ProgramViewerPage = () => import("pages/ProgramViewerPage.vue");
const ProgramLibraryPage = () => import("pages/ProgramLibraryPage.vue");
const UserLoginPage = () => import("pages/UserLoginPage.vue");
const UserRegisterPage = () => import("pages/UserRegisterPage.vue");
const UserProfilePage = () => import("pages/UserProfilePage.vue");
const PrivacyPolicyPage = () => import("pages/PrivacyPolicyPage.vue");
const CookiePolicyPage = () => import("pages/CookiePolicyPage.vue");
const TermsAndConditionPage = () => import("pages/TermsAndConditionsPage.vue");
const NotFoundPage = () => import("pages/NotFoundPage.vue");

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
  // Home layout
  {
    path: "/",
    component: MainLayout,
    redirect: { name: NamedRoutes.home },
    children: [
      // Home page
      {
        path: "",
        name: NamedRoutes.home,
        component: HomePage,
        meta: {
          title: "Home",
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.landing,
          redirectNotAuthenticated: NamedRoutes.landing,
        },
      },
    ],
  },

  // Layout for external users
  {
    path: "/_ExternalLayout",
    component: ExternalLayout,
    redirect: { name: NamedRoutes.landing },
    children: [
      {
        path: "/welcome",
        name: NamedRoutes.landing,
        component: LandingPage,
        meta: {
          title: "Welcome",
          showHeader: true,
        },
      },

      {
        path: "/confirmation",
        name: NamedRoutes.landingConfirmation,
        component: LandingConfirmationPage,
        meta: {
          title: "Welcome",
          showHeader: true,
        },
      },
    ],
  },

  // Main app layout
  {
    path: "/_MainLayout",
    component: MainLayout,
    redirect: { name: NamedRoutes.notFound },
    children: [
      {
        path: "/athletes",
        name: NamedRoutes.athletes,
        component: AthletesPage,
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
        component: LibraryPage,
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
        component: ProgramBuilderPage,
        meta: {
          title: "Program",
          restrictAccessByRole: [UserRole.coach],
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.home,
        },
      },

      {
        path: "/program-library",
        name: NamedRoutes.programLibrary,
        component: ProgramLibraryPage,
        meta: {
          title: "Program Library",
          restrictAccessByRole: [UserRole.coach],
          redirectNotAuthorized: NamedRoutes.home,
        },
      },

      {
        path: "/login",
        name: NamedRoutes.login,
        component: UserLoginPage,
        props: true,
        meta: {
          title: "Login",
          redirectAuthenticated: NamedRoutes.home,
        },
      },

      {
        path: "/register",
        name: NamedRoutes.register,
        component: UserRegisterPage,
        meta: {
          title: "Register",
          redirectAuthenticated: NamedRoutes.home,
        },
      },

      {
        path: "/profile",
        name: NamedRoutes.profile,
        component: UserProfilePage,
        meta: {
          title: "Profile",
          redirectNotAuthenticated: NamedRoutes.login,
        },
      },

      {
        path: "/privacy-policy",
        name: NamedRoutes.privacyPolicy,
        component: PrivacyPolicyPage,
        meta: {
          title: "Privacy Policy",
        },
      },

      {
        path: "/cookie-policy",
        name: NamedRoutes.cookiePolicy,
        component: CookiePolicyPage,
        meta: {
          title: "Cookie Policy",
        },
      },

      {
        path: "/terms-and-conditions",
        name: NamedRoutes.termsConditions,
        component: TermsAndConditionPage,
        meta: {
          title: "Terms and Conditions",
        },
      },

      // FIXME delete
      {
        path: "/god",
        name: "god",
        component: () => import("@/pages/ProgramBuilderGodView.vue"),
        meta: {
          title: "God",
        },
      },
    ],
  },

  // Empty layout
  {
    path: "/_EmptyLayout",
    component: EmptyLayout,
    redirect: { name: NamedRoutes.landing },
    children: [
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
            component: ProgramViewerPage,
            meta: {
              title: "View program",
            },
          },
        ],
      },
    ],
  },

  // Not Found Layout
  // Always leave this as last one
  {
    path: "/_NotFoundLayout",
    component: MainLayout,
    children: [
      {
        path: "/:catchAll(.*)*",
        name: NamedRoutes.notFound,
        component: NotFoundPage,
        meta: {
          title: "Page not found",
        },
      },
    ],
  },
];

export default routes;
