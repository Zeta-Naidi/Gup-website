import { createRouter, createWebHistory } from "vue-router";
import apiService from "@/globalServices/apiService";
import { useUserStore } from "@/plugins/pinia/user";

let routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/",
    name: "Login",
    props: true,
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/Profile.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      const response = await apiService
        .axiosToBackend()
        .get("/api/user/details");
      if (response?.data?.success) {
        userStore.setCredentials(response.data.payload);
        next();
      } else {
        throw new Error("Error in authentication");
      }
    } catch (err) {
      console.error(err);
      userStore.setCredentials(null);
      next({ path: "/" });
    }
  } else {
    // Allow access to non-private routes without authentication
    next();
  }
});

export default router;
