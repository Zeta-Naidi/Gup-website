import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    languageChosen: 'it',
    dataNeededAfterComponentReload: null
  }),
  actions: {
    updateLanguage(newLanguage) {
      this.languageChosen = newLanguage;
    },
    setDataNeededAfterComponentReload(params) {
      this.dataNeededAfterComponentReload = params;
    }
  }
});

