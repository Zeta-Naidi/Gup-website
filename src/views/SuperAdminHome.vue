<template>
  <v-container>
    <h1>{{ getTranslation("WELCOME_IN_HOME_SUPER_ADMIN") }}</h1>
    <p>{{ getTranslation("CHOOSE_DISTRIBUTOR") }}:</p>
    <v-layout row wrap>
      <div v-for="(card, index) in cardList" :key="index">
        <v-card :color="card.color" :hover="true" @click="selectCard(card)" class="mx-1">
          <v-card-title>{{ card.title }}</v-card-title>
          <v-card-subtitle>{{ card.subtitle }}</v-card-subtitle>
        </v-card>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";

export default {
  name: "SuperAdminHome",
  data: () => ({
    cardList: [],
    loadingItems: false,
  }),
  created() {
    this.fetchErmetixDistributors();
  },
  methods: {
    async selectCard(card) {
      this.loadingItems = true;
      try {
        let response = await apiService.axiosToBackend().put("/api/databaseConnection/setDistributorToUser",{
            connection: card.subtitle,
          })
        if (response?.data?.success)
          this.$router.push({name: 'Home'});
        this.loadingItems = false
      } catch (err) {
        this.loadingItems = false;
        utilsFunctions.handleServerResponseException(err);
      }

    },
    async fetchErmetixDistributors() {
      this.loadingItems = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/databaseConnection")
        if (response?.data?.success)
          this.cardList = response.data.payload.distributors.map(el => ({
            color: this.getRandomColor(),
            title: el.distributorName,
            subtitle: el.database,
          }));
        this.loadingItems = false
      } catch (err) {
        this.loadingItems = false;
        utilsFunctions.handleServerResponseException(err);
      }
    },
    getRandomColor() {
      let letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  },
};
</script>
