<template>
  <v-select
    color="white"
    :items="languages"
    v-model="languageChosen"
    item-value="name"
    :item-title="item => null"
    style="max-width: 60px"
    append-inner-icon=""
    hide-details="auto"
    class="mt-0 pt-0"
    @update:modelValue="setNewLanguage"
    @click.stop
  >
    <template #selection="{ item,index }">
      <div>
        <v-img
          aspect-ratio="16/9"
          cover
          width="30"
          :src="item.raw.image"
        />
      </div>
    </template>
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <v-img
          :src="item.raw.image"
          aspect-ratio="16/9"
          cover
          width="30"
        />
      </v-list-item>
    </template>
  </v-select>
</template>
<script>
import {useAppStore} from "@/plugins/pinia/app";
import {mapWritableState} from "pinia";
import {computed} from "vue";

export default {
  name: "LanguageSelector",
  data() {
    return {
      languages: [
        {name: "it", image: "/images/italyFlag.jpeg"},
        {name: "en", image: "/images/ukFlag.png"},
        {name: "de", image: "images/germanyFlag.jpeg"},
        {name: "es", image: "/images/spainFlag.jpeg"},
      ],
    }
  },
  computed: {
    languageChosen: {
      get() {
        // Use the languageChosen from the store
        return useAppStore().languageChosen;
      },
      set(value) {
        // Set the new language using the store's action
        useAppStore().updateLanguage(value);
      },
    },
  },
  methods: {
    setNewLanguage(newLanguage) {
      // Handle the new language if needed
      // You can call this method directly or use the computed property
      this.languageChosen = newLanguage;
    },
  },
}

</script>


<style scoped>
:deep(.v-field__append-inner){
  display: none;
}
</style>
