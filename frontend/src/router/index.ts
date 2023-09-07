import { createRouter, createWebHistory } from "vue-router";

/* (dinamically) import the views */
import HomeView from "../views/HomeView.vue";
const LibraryView = () => import("@/views/LibraryView.vue");
const ScheduleView = () => import("@/views/ScheduleView.vue");
const DashboardView = () => import("@/views/DashboardView.vue");

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
    // page not found
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: HomeView,
    meta: {
      title: "Page not found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

/* Set the page title */
router.afterEach((to) => {
  document.title = (to.meta.title ? to.meta.title + " - " : "") + ""; // TODO + app name
});

export default router;
