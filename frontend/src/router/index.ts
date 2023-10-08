import { createRouter, createWebHistory, RouteRecordName } from "vue-router";
import { useUserStore } from "@/stores/user";

/* (dinamically) import the views */
import HomeView from "../views/HomeView.vue";
const AthletesView = () => import("@/views/AthletesView.vue");
const LibraryView = () => import("@/views/LibraryView.vue");
const ScheduleView = () => import("@/views/ScheduleView.vue");
const UserLoginView = () => import("@/views/UserLoginView.vue");
const UserRegisterView = () => import("@/views/UserRegisterView.vue");
const UserProfileView = () => import("@/views/UserProfileView.vue");
const UserOnboardingView = () => import("@/views/UserOnboardingView.vue");
const ComingSoonView = () => import("@/views/ComingSoonView.vue");

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
    },
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: {
      title: "Library",
    },
  },
  {
    path: "/schedule",
    name: "schedule",
    component: ScheduleView,
    meta: {
      title: "Schedule",
    },
  },
  {
    path: "/login",
    name: "login",
    component: UserLoginView,
    props: true,
    meta: {
      title: "Login",
      redirectAuthenticated: "profile",
    },
  },
  {
    path: "/register",
    name: "register",
    component: UserRegisterView,
    meta: {
      title: "Register",
      redirectAuthenticated: "profile",
    },
  },
  {
    // TODO delete
    path: "/onboard",
    name: "onboarding",
    component: UserOnboardingView,
    meta: {
      title: "Onboarding",
    },
  },
  {
    path: "/coming-soon",
    name: "comingsoon",
    component: ComingSoonView,
    meta: {
      title: "Coming Soon",
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
    component: HomeView, // TODO
    meta: {
      title: "Privacy Policy",
    },
  },
  {
    path: "/terms-and-conditions",
    name: "terms_conditions",
    component: HomeView, // TODO
    meta: {
      title: "Terms and Conditions",
    },
  },
  {
    // page not found
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: HomeView, // TODO
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

  // Check if authenticated user needs to be redirected
  if (
    user.isSignedIn &&
    to.meta.redirectAuthenticated &&
    to.name !== to.meta.redirectAuthenticated
  ) {
    // Redirect user
    return { name: to.meta.redirectAuthenticated as RouteRecordName };
  }

  // Check if not authenticated user needs to be redirected
  if (
    !user.isSignedIn &&
    to.meta.redirectNotAuthenticated &&
    to.name !== to.meta.redirectNotAuthenticated
  ) {
    // Redirect user
    return { name: to.meta.redirectNotAuthenticated as RouteRecordName };
  }
});

/* Set the page title */
router.afterEach((to) => {
  document.title = (to.meta.title ? to.meta.title + " - " : "") + ""; // TODO + app name
});

export default router;
