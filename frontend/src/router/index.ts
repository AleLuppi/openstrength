import { createRouter, createWebHistory, RouteRecordName } from "vue-router";
import { useUserStore } from "@/stores/user";

/* (dinamically) import the views */
import HomeView from "../views/HomeView.vue";
const LibraryView = () => import("@/views/LibraryView.vue");
const ScheduleView = () => import("@/views/ScheduleView.vue");
const DashboardView = () => import("@/views/DashboardView.vue");
const UserLoginView = () => import("@/views/UserLoginView.vue");
const UserRegisterView = () => import("@/views/UserRegisterView.vue");
const UserProfileView = () => import("@/views/UserProfileView.vue");

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
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard",
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
      title: "register",
      redirectAuthenticated: "profile",
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: UserProfileView,
    meta: {
      title: "profile",
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
  console.log(user.uid);

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
