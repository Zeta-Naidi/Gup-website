<template>
  <!-- FUNZIONE CONFIGURA -->
  <div style="
      width: 500px;
      display: block;
      border: 1px solid #6e6e6e;
      border-radius: 3px;
      height: 350px;
      background-color: #6c6c6c;
      left: calc(50% - 250px);
      position: relative;"
  >

    <v-img
      :src="img"
      width="32"
      height="32"
      style="position: absolute;
                          top: 50px;
                          left: 50px;"
    />

    <p
      style="display: block;
                          margin: auto;
                          width: 300px;
                          font-weight: 700;
                          text-align: left;
                          margin-top: 50px;"
    >
      {{title}}</p>

    <span style="margin-top: 20px;
                          display: block;
                          margin: auto;
                          width: 350px;
                          text-align: left;
                          margin-left: 20%;"
    >{{description}}</span>

    <span style="margin-top: 20px;
                          display: block;
                          width: 350px;
                          text-align: left;
                          margin-left: 20%;">
      <b v-if="notes != null">Nota: </b>{{notes}}</span>

    <v-btn style="position: absolute;
          left: calc(50% - 75px);
          width: 150px;
          bottom: 50px"
           color="primary"
           @click="execute"
    >
      Configura
    </v-btn>
  </div>


</template>

<script>

export default {
  name: 'ConfigurePayload',
  props: {
    title: String,
    description: String,
    notes: String,
    img: String,
    isModalConfig: Boolean,
  },
  data() {
    return {

    };
  },
  methods: {
    execute() {
      this.$emit('execute');
    },
  },
};
</script>

<style scoped>
</style>
