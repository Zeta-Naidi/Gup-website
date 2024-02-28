<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <template v-slot:default>
          {{ componentName }}
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <ul v-if="bluetoothInterfaces">
          <li>
            <p>{{ getTranslation("INTERFACE_BLUETOOTH") }} <span class="listValue">{{ bluetoothInterfaces.replace(/"/g,
              '') }}</span></p>
          </li>
        </ul>
        <ul>
          <li v-for="_interface in parsedJson" :key="_interface.name">
            <!-- <p>{{ parsedJson }}</p> -->
            <strong>{{ _interface.name }}</strong>
            <p>{{ getTranslation("INTERFACE_IP") }} <span class="listValue">{{ _interface.ip }}</span></p>
            <p>{{ getTranslation("INTERFACE_MAC") }} <span class="listValue">{{ _interface.mac }}</span></p>
            <p>{{ getTranslation("INTERFACE_TYPE") }} <span class="listValue">{{ _interface.type }}</span></p>

            <ul v-if="_interface.randomizedMacAddresses">
              <li v-for="address in _interface.randomizedMacAddresses" :key="address.randomizedMacAddress">
                <p>{{ getTranslation("INTERFACE_SSID") }} <span class="listValue">{{ address.ssid }}</span></p>
                <p>{{ getTranslation("RANDOMIZED_MAC") }} <span class="listValue">{{ address.randomizedMacAddress
                }}</span></p>
                <p>{{ getTranslation("INTERFACE_CONNECTED") }}: <span class="listValue">{{ address.isConnected ? "Yes" :
                  "No" }}</span>
                </p>
              </li>
            </ul>
          </li>
        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import translateService from "@/globalServices/translate";

export default {
  name: "NetworkInterfaceDropdown",
  props: {
    networkInterfaces: {
      type: String,
      default: "",
    },
    bluetoothInterfaces: {
      type: String,
      default: null,
    },
    componentName: {
      type: String,
      default: "",
      required: false,
    },
  },
  data() {
    return {
      parsedJson: [],
    };
  },
  mounted() {
    if (this.networkInterfaces) {
      this.parsedJson = JSON.parse(this.networkInterfaces);
    }
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  computed: {
    languageChosen() {
      return this.$store.state.language;
    }
  },
};
</script>

<style scoped lang="scss">
.v-expansion-panels .v-expansion-panel {
  background-color: transparent;
}

.v-expansion-panel::before {
  box-shadow: none;
}

.v-expansion-panel-header {
  padding: 0;
  min-height: auto;
}

.v-expansion-panel-header__overlay {}

.v-expansion-panel-header--active>.v-expansion-panel-header__overlay {
  opacity: unset;
}

.v-expansion-panel--active>.v-expansion-panel-header--active {
  padding: 0;
  transform: scale(1);
  transition: 0.15s all ease;
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 1rem 0 1rem;
  background: rgba(0, 0, 0, 0.3);
}
</style>
