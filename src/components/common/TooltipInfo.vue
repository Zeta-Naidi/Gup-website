<template>
  <v-tooltip bottom class="personalTooltip">
    <template v-slot:activator="{ on, attrs }">
      <v-icon
        color="primary"
        dark
        v-bind="attrs"
        v-on="on"
      >
        mdi-information-outline
      </v-icon>
    </template>
    <div
      v-for="(item, index) in itemsToPrint"
      :key="index"
    >
      {{item}}
    </div>
  </v-tooltip>
</template>

<script>
export default {
  name: "TooltipInfo",
  data: () =>
    ({

    }),
  props: {
    itemsToPrint: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
.v-tooltip__content{
  background-color: rgba(97, 97, 97, 1) !important;
  opacity: 1 !important;
}

</style>
