<template>
  <v-container fluid>
    <v-data-table
      :headers="headers"
      :items="activities"
      hide-default-footer
      class="elevation-1"
      :loading="false"
    >
      <template
        v-if="activities"
        v-slot:item="{ item }"
      >
        <tr>
          <td>{{ item.sent }}</td>
          <td>{{ item.delivered }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  import translateService from "@/globalServices/translate";
  import {useAppStore} from "@/plugins/pinia/app";

  export default {
    name: "ActivitiesSection",
    props: {
      currentDevice: {
        type: Object,
        required: true,
        default: {},
      },
      labels: {
        type: Object,
        required: false,
        default: [],
      },
    },
    setup() {
      const appStore = useAppStore();

      return {
        languageChosen: appStore.languageChosen,
      };
    },
    data() {
      return {
        selectedLanguage: "",
        activities: [],
        headers: [
          {
            title: translateService.getTranslation(
              this.languageChosen,
              "SENT"
            ),
            value: "sent",
            align: "start",
            sortable: true,
          },
          {
            title: translateService.getTranslation(
              this.languageChosen,
              "DELIVERED"
            ),
            value: "delivered",
            sortable: true,
          },
          {
            title: translateService.getTranslation(
              this.languageChosen,
              "TYPE"
            ),
            value: "type",
            sortable: true,
          },
          {
            title: translateService.getTranslation(
              this.languageChosen,
              "STATUS"
            ),
            value: "status",
            sortable: true,
          },
        ],
      };
    },
    watch: {
      activities() {
        console.log("activities", this.activities);
      },
    },
    created() {
      // this.activities = this.currentDevice.activitiesDate;
      this.initializeActivities();
    },
    mounted() {},
    methods: {
      getTranslation(key) {
        let result = translateService.getTranslation(this.languageChosen, key);
        if (!result) return key;
        else return result;
      },
      async initializeActivities() {
        try {
          const rawData = await this.fetchActivities();
          const processedData = this.processData(rawData);
          this.assignToData(processedData);
        } catch (error) {
          console.error("Si è verificato un errore:", error);
        }
      },
      async fetchActivities() {
        const data = `<tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LDBd" actionid="670988" action="UpdateInfosAction" status="0"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:58:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass pending" style="">In attesa</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"><i class="fa fa-times setDeliveryStatusCancelled" deviceid="1" actionId="670988" action="UpdateInfosAction"></i></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670981" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:55:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670974" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:52:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670967" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:49:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670960" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:46:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670953" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:43:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670946" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:40:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr><tr uniq_id="WyJVcGRhdGVJbmZvc0FjdGlvbiIseyJhbHNvQXBwcyI6dHJ1ZSwiYWxzb0NlcnRzIjp0cnVlLCJhbHNvUHJvZmlsZXMiOnRydWUsImFsc29VcGRhdGVzIjp0cnVlLCJhbHNvVXNlckxpc3RTaGFyZWRJcGFkIjp0cnVlLCJhbHNvUmVzdHJpY3Rpb25zTGlzdCI6dHJ1ZSwiYWxzb01lZGlhTGlzdCI6dHJ1ZSwiYWxzb0FwcFN0YXRzIjp0cnVlLCJnZXRBdmFpbGFibGVXaWZpQ29ubmVjdGlvbnMiOmZhbHNlLCJhbHNvVXNlckxpc3RNYWNPcyI6ZmFsc2V9LC0yXQ==" actionid="670939" action="UpdateInfosAction" status="-2"><td style="text-align:left !important;" class="convertUtcToLocalTime">2023-10-09T14:37:12Z</td><td class="convertUtcToLocalTime deliveredAction" style="text-align: left !important;">--</td><td style="text-align:left !important;min-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">Aggiorna Informazioni</td><td class="statusClass cancelled" style="">Annullato</td><td class="btnRemoveActivity" style="width:40px;" style="text-align:center"></td></tr>`;
        return data;
      },
      processData(data) {
        const wrappedData = `<table>${data}</table>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrappedData, "text/html");
        const rows = doc.querySelectorAll("tr");
        if (!rows || rows.length === 0) {
          return [];
        }

        const result = Array.from(rows).map((row) => {
          const sentElement = row.querySelector("td.convertUtcToLocalTime");
          const deliveredElement = row.querySelector("td.deliveredAction");
          const typeElement = row.querySelectorAll("td")[2];
          const statusElement = row.querySelector("td.statusClass");

          return {
            sent: sentElement ? sentElement.textContent.trim() : "",
            delivered: deliveredElement
              ? deliveredElement.textContent.trim()
              : "",
            type: typeElement ? typeElement.textContent.trim() : "",
            status: statusElement ? statusElement.textContent.trim() : "",
          };
        });
        return result;
      },
      assignToData(processedData) {
        this.activities = processedData;
      },
    },
  };
</script>

<style scoped lang="scss">
  .status-highlight {
    background-color: yellow;
    background-color: rgb(var(--v-theme-yellow-lighten-3));
  }
</style>
