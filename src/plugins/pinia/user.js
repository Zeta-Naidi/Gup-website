import {defineStore} from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: '',
      companyName: '',
      id: '',
      isAdmin: false,
      distributorName: '',
      rolesUser: {},
      levelAdmin: ''
    },
  }),
  persist: {
    storage: sessionStorage,
  },
  actions: {
    setCredentials(user) {
      if (!!user) {
        this.user.username = user.username;
        this.user.companyName = user.companyName;
        this.user.id = user.id;
        this.user.isAdmin = user.isAdmin;
        this.user.distributorName = user.distributorName;
        this.user.type = user.type;
        this.user.rolesUser = user.rolesUser;
        this.user.levelAdmin = user.levelAdmin;
      } else {
        this.user.username = '';
        this.user.companyName = '';
        this.user.id = null;
        this.user.isAdmin = false;
        this.user.distributorName = '';
        this.user.type = null;
        this.user.rolesUser = {};
        this.user.levelAdmin = '';
      }
    },
  },
  getters: {}
});

