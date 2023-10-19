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
const ScheduleView = () => import("@/views/ScheduleView.vue");
const UserLoginView = () => import("@/views/UserLoginView.vue");
const UserRegisterView = () => import("@/views/UserRegisterView.vue");
const UserProfileView = () => import("@/views/UserProfileView.vue");
const PageNotFoundView = () => import("@/views/PageNotFoundView.vue");
const PrivacyPolicyView = () => import("@/views/PrivacyPolicyView.vue");
const TermsAndConditionView = () =>
  import("@/views/TermsAndConditionsView.vue");

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
    path: "/schedule",
    name: "schedule",
    component: ScheduleView,
    meta: {
      title: "Schedule",
      restrictAccessByRole: [UserRole.coach],
      redirectNotAuthorized: "home",
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
    component: PrivacyPolicyView, // TODO
    meta: {
      title: "Privacy Policy",
    },
  },
  {
    path: "/terms-and-conditions",
    name: "terms_conditions",
    component: TermsAndConditionView, // TODO
    meta: {
      title: "Terms and Conditions",
    },
  },
  {
    // page not found
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: PageNotFoundView, // TODO
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
