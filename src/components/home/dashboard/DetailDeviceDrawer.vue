<template>
  <div>
    <v-card
      id="mySidenav"
      class="sidenav"
      style="border-color: #63adf2;
      border-style: solid;
      max-height: 100vh;
      overflow-y: scroll;"
    >
      <DetailDevice
        v-if="openDrawer"
        :device-serial-number="deviceSerialNumber"
        :device-name="deviceName"
        :load-linked-apps="false"
      >
        <template v-slot:clear>
          <div class="d-flex justify-end fixed-header">
            <v-icon color="red" @click="$emit('close')">
              mdi-close
            </v-icon>
          </div>
        </template>
      </DetailDevice>
    </v-card>
    <RepairDialog
      v-model="repairDialogOpened"
      :item="itemRepairDialog"
      @close="repairDialogOpened = false"
      @eventResolved="hardeningActions =
       hardeningActions.filter(el => el.id !== itemRepairDialog.id);
      repairDialogOpened= false;"
    ></RepairDialog>
  </div>
</template>

<script>

import translateService from "@/globalServices/translate";
import RepairDialog from "@/components/common/RepairDialog.vue";
import DetailDevice from "@/components/global/DetailDevice.vue";

export default {
  name: "DetailDeviceDrawer",
  components: {DetailDevice, RepairDialog},
  data: () => ({
    isOpen: false,
    loadingData: true,
    criticEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    score: 0,
    hardeningActions: [],
    repairDialogOpened: false,
    itemRepairDialog: undefined,
  }),
  props: {
    openDrawer: {
      type: Boolean,
      default: false
    },
    deviceSerialNumber: {
      type: String,
      default: undefined
    },
    deviceName: {
      type: String || null,
      default: null
    }
  },
  methods: {
    openNav() {
      document.getElementById("mySidenav").style.width = "29%";
    },
    closeNav() {
      document.getElementById("mySidenav").style.width = "0";
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  watch: {
    openDrawer(newVal) {
      if (newVal) {
        this.openNav();
      } else {
        this.closeNav();
      }
    },
  },
  computed: {
    languageChosen() {
      return this.$store.state.language;
    },
  }
}
</script>

<style lang="scss" scoped>
.text-field-critic {
  ::v-deep {
    fieldset {
      color: #b60000 !important;
    }

    .v-label--active {
      color: #b60000 !important;
      background-color: #1e1e1e;
    }

    .v-icon {
      color: #b60000 !important;
    }
  }
}

.text-field-high {
  ::v-deep {
    fieldset {
      color: #f02929 !important;
    }

    .v-label--active {
      color: #f02929 !important;
      background-color: #1e1e1e;
    }

    .v-icon {
      color: #f02929 !important;
    }
  }
}

.text-field-medium {
  ::v-deep {
    fieldset {
      color: #f27516 !important;
    }

    .v-label--active {
      color: #f27516 !important;
      background-color: #1e1e1e;
    }

    .v-icon {
      color: #f27516 !important;
    }
  }
}

.text-field-low {
  ::v-deep {
    fieldset {
      color: #fec601 !important;
    }

    .v-label--active {
      color: #fec601 !important;
      background-color: #1e1e1e;
    }

    .v-icon {
      color: #fec601 !important;
    }
  }
}

/* The side navigation menu */
.sidenav {
  height: 100%;
  width: 0;
  position: fixed;
  top: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  transition: 0.5s;
  overscroll-behavior: contain;
  z-index: 999;
}


</style>
<style lang="sass" scoped>
.fixed-header
  position: sticky
  top: 0
  right: 0
  width: 100%
  height: 30px
  background-color: #1e1e1e
  z-index: 999
</style>
