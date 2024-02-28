<template>

  <v-dialog
    transition="dialog-bottom-transition"
    persistent
    v-model="showDialog"
    width="950"
  >
    <v-card height="62vh">
      <div class="modal-header" style="align-items: center;display: flex;">
        <p class="text-h5 h5-header">{{ getTranslation(actionFormContent['Labels'][0].value) }}</p>
        <v-spacer></v-spacer>
        <v-icon
          color="primary"
          size="small"
          @click="close"
        >
          mdi-close
        </v-icon>

      </div>
      <v-card-text height="52vh" style="overflow: auto">
        <v-container>
          <div v-for="(elem) in actionFormContent['Fields']">
            <v-row :key="elem.id">
              <v-col>
                <template v-if=" shouldShowElement(elem)">
                  <p v-if="elem.input_type !== 'btn'" style="font-weight: bold;">
                    {{ elem.label }}
                  </p>
                  <label class="label_desc" v-html="elem.description" v-if="elem.description !== ''"></label>
                  <br>

                  <template v-if="elem.input_type === 'text'">
                    <v-responsive
                      max-width="350">
                      <v-text-field variant="outlined" density="comfortable" v-model="elem.value"/>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'multitext'">
                    <v-responsive
                      max-width="550">
                      <v-text-field
                        density="comfortable"
                        v-model="elem.dynamicInputValue"
                        @keydown.enter="addItem(elem)"
                        placeholder="Aggiungere un elemento e premere Invio"
                      ></v-text-field>

                      <v-select
                        density="comfortable"
                        v-model="elem.options"
                        :items="elem.options"
                        label="Elementi aggiunti"
                        multiple
                      >
                        <template v-slot:selection="{ item, index }">
                          <v-chip
                            color="primary">

                            <template v-slot:append>
                              <v-icon
                                @click.stop="removeItem(elem, index)">
                                fas fa-xmark
                              </v-icon>
                            </template>
                            {{item.title}}
                          </v-chip>
                        </template>
                      </v-select>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'checkbox'">
                    <v-checkbox v-model="elem.value" density="comfortable"></v-checkbox>
                  </template>

                  <template v-else-if="elem.input_type === 'multiselect'">
                    <v-responsive
                      max-width="350">
                      <v-select
                        density="comfortable"
                        :items="elem.options"
                        v-model="elem.value"
                        variant="outlined"
                      ></v-select>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'number'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        v-model="elem.value"
                        type="number"
                        :min="elem.min"
                        :max="elem.max"
                        variant="outlined"
                      ></v-text-field>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'file'">
                    <v-responsive
                      max-width="350">
                      <v-file-input v-model="elem.value" density="comfortable" variant="outlined" class="shrink mx-4"></v-file-input>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'password'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        v-model="elem.value"
                        type="password"
                        variant="outlined"
                        class="shrink mx-4"
                      ></v-text-field>
                    </v-responsive>
                  </template>

                  <template v-else-if="elem.input_type === 'btn'">
                    <v-btn v-model="elem.value" >{{elem.label}}</v-btn>
                  </template>

                  <template v-else-if="elem.input_type === 'url'">
                    <v-text-field v-model="elem.value" placeholder="Url"> </v-text-field>
                  </template>

                  <template v-else>
                    <p style="color: red; font-weight: bold">TODO...</p>
                  </template>
                </template>
              </v-col>
            </v-row>
          </div>

          <br>

          <p v-if="actionFormContent['Labels'][1]">{{ getTranslation(actionFormContent['Labels'][1].value) }}</p>
        </v-container>
      </v-card-text>

      <v-card-actions>
        {{ getTranslation("THE_ACTION_WILL_BE_APPLIED_TO") }} {{appliedTo['type']}}  with Serial: {{appliedTo['item']['serialNumber']}}
        <v-spacer></v-spacer>
        <v-btn
          :loading="loadingBtn"
          color="primary"
          variant="outlined"
          @click="close">
          {{ getTranslation("CLOSE") }}
        </v-btn>
        <v-btn
          :loading="loadingBtn"
          color="primary"
          variant="elevated"
          @click="execute">
          {{ getTranslation("EXECUTE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  created() {
    this.showDialog = this.show
  },
  name: "ActionMenu",
  data() {
    return {
      showDialog: false,
    }
  },
  props: {
    show: Boolean,
    selectedAction: Array|Object,
    appliedTo: Array,
    loadingBtn: Boolean,
    actionFormContent: Array|Object,
  },
  methods: {
    shouldShowElement(elem){
      if(elem.os){
        return elem?.os === this.appliedTo['item']['osType']
      }else{
        return true
      }
    },
    addItem(item) {
      if (item.dynamicInputValue.trim() !== '') {
        item.options.push(item.dynamicInputValue);
        item.dynamicInputValue = ''; // Clear the input field
      }
    },
    close(){
      this.$emit("close", 'formSimple');
    },
    execute(){
      this.$emit("execute", this.selectedAction['actionIdentifier'], this.appliedTo['item']['id'], this.sanitizeDataForm(this.actionFormContent), 'formSimple');
    },
    sanitizeDataForm(actionFormContent){
      if(actionFormContent.Fields){
        return actionFormContent.Fields.map(({ id, value, paramId }) => ({ id, value, paramId }));
      }else{
        return null
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
    //
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style>
*{
  font-size: 13px;
}
</style>
