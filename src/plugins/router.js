import {createRouter, createWebHistory} from 'vue-router'
import apiService from "@/globalServices/apiService";
import {useUserStore} from "@/plugins/pinia/user";

let routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/',
    name: 'Login',
    props: true,
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
  },
  {
    path: '/handleUsers',
    name: 'handleUsers',
    component: () => import('@/views/IamView.vue'),
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('../views/Log.vue'),
  },
  {
    path: '/distributorsHome',
    name: 'distributorsHome',
    component: () => import('@/views/DistributorsHome.vue'),
  },
  {
    path: '/superAdminHome',
    name: 'superAdminHome',
    component: () => import('@/views/SuperAdminHome.vue'),
  },
  {
    path: '/handleDevices',
    name: 'handleDevices',
    component: () => import('@/views/HandleDevices.vue'),
  },/*
  {
    path: '/filterDialog',
    name: 'filterDialog',
    component: () => import('@/components/home/uemDevice/FiltersDialog.vue'),
  },
*/
  /*  {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/Log.vue'),
    },
    {
      path: '/distributorsHome',
      name: 'distributorsHome',
      component: () => import('@/views/DistributorsHome.vue'),
    },
    {
      path: '/superAdminHome',
      name: 'SuperAdminHome',
      component: () => import('@/views/SuperAdminHome.vue'),
    },
    ,
    {
      path: '/configurations',
      name: 'configurations',
      component: () => import('@/views/Configuration.vue'),
    },
    {
      path: "*",
      name: 'Everything',
      component: () => import('@/views/Login.vue'),
    },
    // TEMP
    {
      path: "/tags",
      name: 'Tags',
      component: () => import('@/views/TagsView.vue'),
    }*/
]

if (import.meta.env.VITE_APP_CLIENT === 'telsy')
  routes.forEach(el => el.path = '/siem' + el.path)


/*  KEEP COMMENT
  try {
    axios.defaults.withCredentials = true;
    const response = await axios.get(process.env.VUE_APP_BASEURL + "/api/user/details");
    if (response?.data?.success)
      this.$store.commit('setCredentials', response.data.payload);
  } catch (err) {
    console.log(err)
    //unauthorized case
    if (err.response && err.response.status === 401) {
      this.$store.commit('setCredentials', null);
      this.$router.push({name: 'Login'}).catch(() => {
      })
    }
    //block case
    else if (err.response && err.response.status === 429) {
      this.$store.commit('setCredentials', null);
      this.$router.push({
        name: 'Login',
        params: {
          redirectUserBlocked: true
        }
      }).catch(() => {
      })
    }*/


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  //try to access a generic page for the first time
  if ((!from.name && to.name !== 'Login') || (from?.name === 'superAdminHome')) {
    try {
      const userStore = useUserStore();
      const response = await apiService.axiosToBackend().get("/api/user/details");
      if (response?.data?.success){
        userStore.setCredentials(response.data.payload);
      }
      else new Error('Error in authentication')
    } catch (err) {
      console.log(err);
      const userStore = useUserStore();
      userStore.setCredentials(null);
      next({path: '/'});
      return;
    }
  }
  next();
})


export default router

