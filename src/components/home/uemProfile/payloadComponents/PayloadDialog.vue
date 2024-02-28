<template>
  <v-dialog
    v-model="localValue"
    :persistent="true"
    width="2400px"
    max-height="90vh"
  >
    <v-card>
      <v-card-title
        class="v-card-title">

        {{title}} - {{operatingSystem}}
        <v-icon v-if="operatingSystem === 'Windows'" class="icons" style="color: #0076FD">mdi-microsoft-windows</v-icon>
        <v-icon v-else-if="operatingSystem === 'Apple'" class="icons" style="color: #000000" >mdi-apple</v-icon>
        <v-icon v-else-if="operatingSystem === 'Android'" class="icons" style="color: #3dda84">mdi-android</v-icon>
        <v-icon v-else class="icons">mdi-asterisk</v-icon>
      </v-card-title>

      <v-card-text style="max-height: 70vh; padding: 0">
        <v-row no-gutters>
          <v-col cols="2" style="border-right: 1px solid #969696;">
            <v-card class="elevation-0">
              <div class="scrollable-panel">
                <v-list>
                  <v-list-item
                    style="border-bottom: 1px solid #f0f0f0"
                    color="blue"
                    v-for="(tab, index) in tabs"
                    :key="index"
                    :value="tab"
                    @click="selectedTab = index">

                    <template v-slot:prepend>
                      <v-img :src="tab.icon" width="32" height="32"></v-img>
                    </template>
                    <v-list-item>
                      <v-list-item-title v-if="arraySectionsChanged[index].tab === tab.name && arraySectionsChanged[index].configured" style="color: #00cc00">
                        {{ tab.name }}
                      </v-list-item-title>

                      <v-list-item-title v-else>{{ tab.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list-item>
                </v-list>
              </div>

            </v-card>
          </v-col>
          <v-col>
            <div class="scrollable-panel-text">
              <div style="padding: 2vh 10px 2px 10px;">
                <!-- SHOW CONFIGURA DIALOG -->

                <div v-if="checkIfShowConfig(tabs[selectedTab]) && showConfigDialog[selectedTab]">
                  <configure-payload
                    :title="tabs[selectedTab].config.title"
                    :description="tabs[selectedTab].config.description"
                    :img="tabs[selectedTab].config.img"
                    :notes="tabs[selectedTab].config.notes"
                    @execute="executeConfig(tabs[selectedTab].name)"
                  >
                  </configure-payload>
                </div>

                <!-- SE GIà CONFIGURATO OPPURE APPENA CONFIGURATO -->
                <div v-else>
                  <div v-if="operatingSystem === 'Mixed'">
                    <div v-if="tabs[selectedTab].osCategories && tabs[selectedTab].osCategories.length > 0">
                      <v-btn
                        v-if="tabs[selectedTab].name !== 'General'"
                        style="float: right"
                        class="ma-2"
                        color="primary"
                        icon="mdi-minus"
                        @click="removePayloadFromProfile(tabs[selectedTab].name)"
                      ></v-btn>

                      <v-tabs v-model="tabMixedOS" style="background-color: #2196f3" v-if="tabs[selectedTab].name !== 'General'"> <!-- TODO: change -->
                        <v-tab v-for="(category, index) in tabs[selectedTab].osCategories" :key="index" :value="category">
                          <v-icon v-if="category === 'Windows'" style="color: #0076FD">mdi-microsoft-windows</v-icon>
                          <v-icon v-else-if="category === 'Apple'" style="color: #000000" >mdi-apple</v-icon>
                          <v-icon v-else-if="category === 'Android'" style="color: #3dda84">mdi-android</v-icon>
                          <v-icon v-else size="small">mdi-asterisk</v-icon>
                        </v-tab>
                      </v-tabs>

                      <v-card-text>
                        <v-window v-model="tabMixedOS">
                          <v-window-item v-for="(category, index) in tabs[selectedTab].osCategories" :key="index" :value="category">
                            <div v-if="tabs[selectedTab].categories">
                              <v-expansion-panels>
                                <v-expansion-panel
                                  :title="category2"
                                  v-for="(category2, index) in tabs[selectedTab].categories"
                                  :key="index">
                                  <v-expansion-panel-text>
                                    <div class="scrollable-panel-content">
                                      <div v-for="(item) in tabs[selectedTab].Fields">
                                        <v-row v-if="item.category === category2 && item.os === category" :key="item.id">
                                          <v-col>
                                            <template v-if=" shouldShowElement(item)">
                                              <p v-if="item.input_type !== 'btn'" style="font-weight: bold;">
                                                {{ item.label }}
                                                <span class="span_fieldID">{{ item.field_id }}</span>
                                              </p>
                                              <label class="label_desc" v-html="item.description"></label>

                                              <template v-if="item.input_type === 'text'">
                                                <v-responsive
                                                  max-width="350">
                                                  <v-text-field variant="outlined" v-model="item.value"/>
                                                </v-responsive>
                                              </template>

                                              <template v-else-if="item.input_type === 'multitext'">
                                                <v-responsive
                                                  max-width="350">
                                                  <!-- Dynamic Input Field -->
                                                  <v-text-field
                                                    v-model="item.dynamicInputValue"
                                                    @keydown.enter="addItem(item)"
                                                    placeholder="Aggiungere un elemento e premere Invio"
                                                  ></v-text-field>
                                                </v-responsive>
                                                <!-- List of Added Items -->
                                                <div class="added-items-container">
                                                    <span class="added-item" v-for="(addedItem, addedIndex) in item.options" :key="addedIndex">
                                                      {{ addedItem }}
                                                      <v-icon @click="removeItem(item, addedIndex)">fas fa-xmark</v-icon>
                                                    </span>
                                                </div>
                                              </template>

                                              <template v-else-if="item.input_type === 'checkbox'">
                                                <v-checkbox v-model="item.value"></v-checkbox>
                                              </template>

                                              <template v-else-if="item.input_type === 'multiselect'">
                                                <v-responsive
                                                  max-width="350">
                                                  <v-select
                                                    :items="item.options"
                                                    v-model="item.value"
                                                    variant="outlined"
                                                  ></v-select>
                                                </v-responsive>
                                              </template>

                                              <template v-else-if="item.input_type === 'number'">
                                                <v-responsive
                                                  max-width="350">
                                                  <v-text-field
                                                    v-model="item.value"
                                                    type="number"
                                                    :rules="item.rules"
                                                    variant="outlined"
                                                  ></v-text-field>
                                                </v-responsive>
                                              </template>

                                              <template v-else-if="item.input_type === 'file'">
                                                <v-responsive
                                                  max-width="350">
                                                  <v-file-input v-model="item.value" variant="outlined" class="shrink mx-4"></v-file-input>
                                                </v-responsive>
                                              </template>

                                              <template v-else-if="item.input_type === 'password'">
                                                <v-responsive
                                                  max-width="350">
                                                  <v-text-field
                                                    v-model="item.value"
                                                    type="password"
                                                    variant="outlined"
                                                    class="shrink mx-4"
                                                  ></v-text-field>
                                                </v-responsive>
                                              </template>

                                              <template v-else-if="item.input_type === 'btn'">
                                                <v-btn v-model="item.value" >{{item.label}}</v-btn>
                                              </template>

                                              <template v-else-if="item.input_type === 'todo'">
                                                <p style="color: red; font-weight: bold">TODO...</p>
                                              </template>
                                            </template>
                                          </v-col>
                                        </v-row>
                                      </div>
                                    </div>

                                  </v-expansion-panel-text>
                                </v-expansion-panel>
                              </v-expansion-panels>
                            </div>

                            <div v-else>
                              <template v-for="osTypeCategory in tabs[selectedTab].osCategories">
                                <div v-for="(item) in tabs[selectedTab].Fields">
                                  <div v-if="isCategoryInOsTypes(osTypeCategory, item.os) && category === osTypeCategory">  <!-- string to array os() -->
                                    <v-row :key="item.id">
                                      <v-col>
                                        <template v-if=" shouldShowElement(item)">
                                          <p v-if="item.input_type !== 'btn'" style="font-weight: bold;">
                                            {{ item.label }}
                                            <span class="span_fieldID">{{ item.field_id }}</span>
                                          </p>
                                          <label class="label_desc" v-html="item.description"></label>
                                          <br>

                                          <template v-if="item.input_type === 'text'">
                                            <v-responsive
                                              max-width="350">
                                              <v-text-field variant="outlined" v-model="item.value"/>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'multitext'">
                                            <v-responsive
                                              max-width="550">
                                              <v-text-field
                                                v-model="item.dynamicInputValue"
                                                @keydown.enter="addItem(item)"
                                                placeholder="Aggiungere un elemento e premere Invio"
                                              ></v-text-field>

                                              <v-select
                                                v-model="item.options"
                                                :items="item.options"
                                                label="Elementi aggiunti"
                                                multiple
                                              >
                                                <template v-slot:selection="{ item, index }">
                                                  <v-chip
                                                    color="primary">

                                                    <template v-slot:append>
                                                      <v-icon
                                                        @click.stop="removeItem(item, index)">
                                                        fas fa-xmark
                                                      </v-icon>
                                                    </template>
                                                    {{item.title}}
                                                  </v-chip>
                                                </template>
                                              </v-select>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'checkbox'">
                                            <v-checkbox v-model="item.value"></v-checkbox>
                                          </template>

                                          <template v-else-if="item.input_type === 'multiselect'">
                                            <v-responsive
                                              max-width="350">
                                              <v-select
                                                :items="item.options"
                                                v-model="item.value"
                                                variant="outlined"
                                              ></v-select>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'number'">
                                            <v-responsive
                                              max-width="350">
                                              <v-text-field
                                                v-model="item.value"
                                                type="number"
                                                :min="item.min"
                                                :max="item.max"
                                                variant="outlined"
                                              ></v-text-field>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'file'">
                                            <v-responsive
                                              max-width="350">
                                              <v-file-input v-model="item.value" variant="outlined" class="shrink mx-4"></v-file-input>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'password'">
                                            <v-responsive
                                              max-width="350">
                                              <v-text-field
                                                v-model="item.value"
                                                type="password"
                                                variant="outlined"
                                                class="shrink mx-4"
                                              ></v-text-field>
                                            </v-responsive>
                                          </template>

                                          <template v-else-if="item.input_type === 'btn'">
                                            <v-btn v-model="item.value" >{{item.label}}</v-btn>
                                          </template>

                                          <template v-else-if="item.input_type === 'form'">
                                            <v-btn @click="showDialogForm(item)" append-icon="fas fa-plus">ADD</v-btn>

                                            <div style="padding-top: 3vh">
                                              <v-chip
                                                v-for="(output, index) in item.form_outputs"
                                                :key="index"
                                                color="primary"
                                                @click="editFormElement(output, index, item)"
                                                size="x-large"
                                              >
                                                <template v-slot:append>
                                                  <v-icon
                                                    @click.stop="removeFormElement(output, item)">
                                                    fas fa-xmark
                                                  </v-icon>
                                                </template>
                                                {{ output.title }}
                                              </v-chip>
                                            </div>
                                          </template>

                                          <template v-else-if="item.input_type === 'todo'">
                                            <p style="color: red; font-weight: bold">TODO...</p>
                                          </template>
                                        </template>
                                      </v-col>
                                    </v-row>
                                  </div>
                                </div>
                              </template>
                            </div>
                          </v-window-item>
                        </v-window>
                      </v-card-text>
                    </div>
                    <div v-else>
                      <!-- SERVE PER LE PAGINE CHE HANNO LO STESSO ESATTO CONTENUTO PER TUTTI I OS -->
                      <div v-for="(item) in tabs[selectedTab].Fields">
                        <div v-if="tabs[selectedTab].categories">
                          <v-expansion-panels>
                            <v-expansion-panel
                              :title="category"
                              v-for="(category, index) in tabs[selectedTab].categories"
                              :key="index">
                              <v-expansion-panel-text>
                                <div class="scrollable-panel-content">
                                  <v-row v-if="item.category === category" :key="item.id">
                                    <v-col>
                                      <template v-if=" shouldShowElement(item)">
                                        <p v-if="item.input_type !== 'btn'" style="font-weight: bold;">
                                          {{ item.label }}
                                          <span class="span_fieldID">{{ item.field_id }}</span>
                                        </p>
                                        <label class="label_desc" v-html="item.description" v-if="item.description !== ''"></label>

                                        <template v-if="item.input_type === 'text'">
                                          <v-responsive
                                            max-width="350">
                                            <v-text-field variant="outlined" density="comfortable" v-model="item.value"/>
                                          </v-responsive>
                                        </template>

                                        <template v-else-if="item.input_type === 'multitext'">
                                          <v-responsive
                                            max-width="350">
                                            <!-- Dynamic Input Field -->
                                            <v-text-field
                                              density="comfortable"
                                              v-model="item.dynamicInputValue"
                                              @keydown.enter="addItem(item)"
                                              placeholder="Aggiungere un elemento e premere Invio"
                                            ></v-text-field>
                                          </v-responsive>
                                          <!-- List of Added Items -->
                                          <div class="added-items-container">
                                            <span class="added-item" v-for="(addedItem, addedIndex) in item.options" :key="addedIndex">
                                                {{ addedItem }}
                                                <v-icon @click="removeItem(item, addedIndex)">fas fa-xmark</v-icon>
                                              </span>
                                          </div>
                                        </template>

                                        <template v-else-if="item.input_type === 'checkbox'">
                                          <v-checkbox v-model="item.value" density="comfortable"></v-checkbox>
                                        </template>

                                        <template v-else-if="item.input_type === 'multiselect'">
                                          <v-responsive
                                            max-width="350">
                                            <v-select
                                              density="comfortable"
                                              :items="item.options"
                                              v-model="item.value"
                                              variant="outlined"
                                            ></v-select>
                                          </v-responsive>
                                        </template>

                                        <template v-else-if="item.input_type === 'number'">
                                          <v-responsive
                                            max-width="350">
                                            <v-text-field
                                              density="comfortable"
                                              v-model="item.value"
                                              type="number"
                                              :rules="item.rules"
                                              variant="outlined"
                                            ></v-text-field>
                                          </v-responsive>
                                        </template>

                                        <template v-else-if="item.input_type === 'file'">
                                          <v-responsive
                                            max-width="350">
                                            <v-file-input v-model="item.value" density="comfortable" variant="outlined" class="shrink mx-4"></v-file-input>
                                          </v-responsive>
                                        </template>

                                        <template v-else-if="item.input_type === 'password'">
                                          <v-responsive
                                            max-width="350">
                                            <v-text-field
                                              density="comfortable"
                                              v-model="item.value"
                                              type="password"
                                              variant="outlined"
                                              class="shrink mx-4"
                                            ></v-text-field>
                                          </v-responsive>
                                        </template>

                                        <template v-else-if="item.input_type === 'btn'">
                                          <v-btn v-model="item.value" >{{item.label}}</v-btn>
                                        </template>

                                        <template v-else-if="item.input_type === 'todo'">
                                          <p style="color: red; font-weight: bold">TODO...</p>
                                        </template>
                                      </template>
                                    </v-col>
                                  </v-row>
                                </div>

                              </v-expansion-panel-text>
                            </v-expansion-panel>
                          </v-expansion-panels>
                        </div>
                        <div v-else>
                          <v-row :key="item.id">
                            <v-col>
                              <template v-if=" shouldShowElement(item)">
                                <p v-if="item.input_type !== 'btn'" style="font-weight: bold;">
                                  {{ item.label }}
                                  <span class="span_fieldID">{{ item.field_id }}</span>
                                </p>
                                <label class="label_desc" v-html="item.description" v-if="item.description !== ''"></label>
                                <br>

                                <template v-if="item.input_type === 'text'">
                                  <v-responsive
                                    max-width="350">
                                    <v-text-field variant="outlined" density="comfortable" v-model="item.value"/>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'multitext'">
                                  <v-responsive
                                    max-width="550">
                                    <v-text-field
                                      density="comfortable"
                                      v-model="item.dynamicInputValue"
                                      @keydown.enter="addItem(item)"
                                      placeholder="Aggiungere un elemento e premere Invio"
                                    ></v-text-field>

                                    <v-select
                                      v-model="item.options"
                                      :items="item.options"
                                      label="Elementi aggiunti"
                                      multiple
                                    >
                                      <template v-slot:selection="{ item, index }">
                                        <v-chip
                                          color="primary">

                                          <template v-slot:append>
                                            <v-icon
                                              @click.stop="removeItem(item, index)">
                                              fas fa-xmark
                                            </v-icon>
                                          </template>
                                          {{item.title}}
                                        </v-chip>
                                      </template>
                                    </v-select>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'checkbox'">
                                  <v-checkbox v-model="item.value" density="comfortable"></v-checkbox>
                                </template>

                                <template v-else-if="item.input_type === 'multiselect'">
                                  <v-responsive
                                    max-width="350">
                                    <v-select
                                      density="comfortable"
                                      :items="item.options"
                                      v-model="item.value"
                                      variant="outlined"
                                    ></v-select>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'number'">
                                  <v-responsive
                                    max-width="350">
                                    <v-text-field
                                      density="comfortable"
                                      v-model="item.value"
                                      type="number"
                                      :min="item.min"
                                      :max="item.max"
                                      variant="outlined"
                                    ></v-text-field>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'file'">
                                  <v-responsive
                                    max-width="350">
                                    <v-file-input v-model="item.value" density="comfortable" variant="outlined" class="shrink mx-4"></v-file-input>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'password'">
                                  <v-responsive
                                    max-width="350">
                                    <v-text-field
                                      density="comfortable"
                                      v-model="item.value"
                                      type="password"
                                      variant="outlined"
                                      class="shrink mx-4"
                                    ></v-text-field>
                                  </v-responsive>
                                </template>

                                <template v-else-if="item.input_type === 'btn'">
                                  <v-btn v-model="item.value" >{{item.label}}</v-btn>
                                </template>

                                <template v-else-if="item.input_type === 'form'">
                                  <v-btn @click="showDialogForm(item)" append-icon="fas fa-plus">ADD</v-btn>

                                  <div style="padding-top: 3vh">
                                    <v-chip
                                      v-for="(output, index) in item.form_outputs"
                                      :key="index"
                                      color="primary"
                                      @click="editFormElement(output, index, item)"
                                      size="x-large"
                                    >
                                      <template v-slot:append>
                                        <v-icon
                                          @click.stop="removeFormElement(output, item)">
                                          fas fa-xmark
                                        </v-icon>
                                      </template>
                                      {{ output.title }}
                                    </v-chip>
                                  </div>
                                </template>

                                <template v-else-if="item.input_type === 'todo'">
                                  <p style="color: red; font-weight: bold">TODO...</p>
                                </template>
                              </template>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else>
                    <div v-if="tabs[selectedTab].categories">
                      <v-btn
                        v-if="tabs[selectedTab].name !== 'General'"
                        style="float: right"
                        class="ma-2"
                        color="primary"
                        icon="mdi-minus"
                        @click="removePayloadFromProfile(tabs[selectedTab].name)"
                      ></v-btn>

                      <v-expansion-panels style="max-width: 150vh">
                        <v-expansion-panel
                          :title="category"
                          v-for="(category, index) in tabs[selectedTab].categories"
                          :key="index">
                          <v-expansion-panel-text>
                            <div class="scrollable-panel-content">
                              <div v-for="(item) in tabs[selectedTab].Fields">
                                <v-row v-if="item.category === category" :key="item.id">
                                  <v-col>
                                    <template v-if=" shouldShowElement(item)">
                                      <p v-if="item.input_type !== 'btn'" style="font-weight: bold;">
                                        {{ item.label }}
                                        <span class="span_fieldID">{{ item.field_id }}</span>
                                      </p>
                                      <label class="label_desc" v-html="item.description" v-if="item.description !== ''"></label>

                                      <template v-if="item.input_type === 'text'">
                                        <v-responsive
                                          max-width="350">
                                          <v-text-field variant="outlined" density="comfortable" v-model="item.value"/>
                                        </v-responsive>
                                      </template>

                                      <template v-else-if="item.input_type === 'multitext'">
                                        <v-responsive
                                          max-width="350">
                                          <!-- Dynamic Input Field -->
                                          <v-text-field
                                            density="comfortable"
                                            v-model="item.dynamicInputValue"
                                            @keydown.enter="addItem(item)"
                                            placeholder="Aggiungere un elemento e premere Invio"
                                          ></v-text-field>
                                        </v-responsive>
                                        <!-- List of Added Items -->
                                        <div class="added-items-container">
                                          <span class="added-item" v-for="(addedItem, addedIndex) in item.options" :key="addedIndex">
                                            {{ addedItem }}
                                            <v-icon @click="removeItem(item, addedIndex)">fas fa-xmark</v-icon>
                                          </span>
                                        </div>
                                      </template>

                                      <template v-else-if="item.input_type === 'checkbox'">
                                        <v-checkbox v-model="item.value" density="comfortable"></v-checkbox>
                                      </template>

                                      <template v-else-if="item.input_type === 'multiselect'">
                                        <v-responsive
                                          max-width="350">
                                          <v-select
                                            density="comfortable"
                                            :items="item.options"
                                            v-model="item.value"
                                            variant="outlined"
                                          ></v-select>
                                        </v-responsive>
                                      </template>

                                      <template v-else-if="item.input_type === 'number'">
                                        <v-responsive
                                          max-width="350">
                                          <v-text-field
                                            density="comfortable"
                                            v-model="item.value"
                                            type="number"
                                            :rules="item.rules"
                                            variant="outlined"
                                          ></v-text-field>
                                        </v-responsive>
                                      </template>

                                      <template v-else-if="item.input_type === 'file'">
                                        <v-responsive
                                          max-width="350">
                                          <v-file-input v-model="item.value" variant="outlined" density="comfortable" class="shrink mx-4"></v-file-input>
                                        </v-responsive>
                                      </template>

                                      <template v-else-if="item.input_type === 'password'">
                                        <v-responsive
                                          max-width="350">
                                          <v-text-field
                                            density="comfortable"
                                            v-model="item.value"
                                            type="password"
                                            variant="outlined"
                                            class="shrink mx-4"
                                          ></v-text-field>
                                        </v-responsive>
                                      </template>

                                      <template v-else-if="item.input_type === 'btn'">
                                        <v-btn v-model="item.value" >{{item.label}}</v-btn>
                                      </template>

                                      <template v-else-if="item.input_type === 'todo'">
                                        <p style="color: red; font-weight: bold">TODO...</p>
                                      </template>
                                    </template>
                                  </v-col>
                                </v-row>
                              </div>
                            </div>

                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </div>
                    <div v-else>
                      <v-btn
                        v-if="tabs[selectedTab].name !== 'General'"
                        style="float: right"
                        class="ma-2"
                        color="primary"
                        icon="mdi-minus"
                        @click="removePayloadFromProfile(tabs[selectedTab].name)"
                      ></v-btn>

                      <div v-for="(elem) in tabs[selectedTab].Fields">
                        <div v-if="isCategoryInOsTypes(operatingSystem, elem.os)"> <!-- && category === osTypeCategory -->
                          <v-row :key="elem.id">
                            <v-col>
                              <template v-if=" shouldShowElement(elem)">
                                <p v-if="elem.input_type !== 'btn'" style="font-weight: bold;">
                                  {{ elem.label }}
                                  <span class="span_fieldID">{{ elem.field_id }}</span>
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

                                <template v-else-if="elem.input_type === 'form'">
                                  <v-btn @click="showDialogForm(elem)" append-icon="fas fa-plus">ADD</v-btn>

                                  <div style="padding-top: 3vh">
                                    <v-chip
                                      v-for="(output, index) in elem.form_outputs"
                                      :key="index"
                                      color="primary"
                                      @click="editFormElement(output, index, elem)"
                                      size="x-large"
                                    >
                                      <template v-slot:append>
                                        <v-icon
                                          @click.stop="removeFormElement(output, elem)">
                                          fas fa-xmark
                                        </v-icon>
                                      </template>
                                      {{ output.title }}
                                    </v-chip>
                                  </div>
                                </template>

                                <template v-else-if="elem.input_type === 'todo'">
                                  <p style="color: red; font-weight: bold">TODO...</p>
                                </template>
                              </template>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- FORM DIALOG-->
      <v-dialog
        persistent
        v-model="dialogForm"
        width="70vh"
      >
        <v-card max-height="70vh">
          <v-card-title>
            prova temporanea <!-- TODO: cambiare il titolo del form-->
          </v-card-title>

          <v-card-text max-height="50vh" style="overflow: auto">
            <div class="pa-5">
              <template v-for="(el) in elemForm.form_inputs">
                <template v-if=" shouldShowElementForm(el)">
                  <p v-if="el.input_type !== 'btn'" style="font-weight: bold;">
                    {{ el.label }}
                    <span class="span_fieldID">{{ el.field_id }}</span>
                  </p>
                  <label class="label_desc" v-html="el.description"></label>
                  <br>

                  <template v-if="el.input_type === 'text'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        variant="outlined"
                        v-model="el.value"
                      />
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'multitext'">
                    <v-responsive
                      max-width="350">
                      <!-- Dynamic Input Field -->
                      <v-text-field
                        density="comfortable"
                        v-model="el.dynamicInputValue"
                        @keydown.enter="addItem(el)"
                        placeholder="Aggiungere un elemento e premere Invio"
                      ></v-text-field>
                    </v-responsive>
                    <!-- List of Added elems -->
                    <div class="added-items-container">
                      <span class="added-item" v-for="(addedelem, addedIndex) in el.options" :key="addedIndex">
                        {{ addedelem }}
                        <v-icon @click="removeItem(el, addedIndex)">fas fa-xmark</v-icon>
                      </span>
                    </div>
                  </template>

                  <template v-else-if="el.input_type === 'form'">
                    <v-btn @click="showdialogFormAnnidato(el)" append-icon="fas fa-plus">ADD</v-btn>
                    <br>

                    <template
                      v-for="(output, index) in el.form_outputs">
                      <v-chip
                        style="margin-top: 1vh"
                        v-if="indexForm === output.idElem || output.idElem===0"
                        :key="index"
                        color="primary"
                        @click="editFormAnnidatoElement(output, index, el)"
                        size="x-large"
                      >
                        <template v-slot:append>
                          <v-icon
                            @click.stop="removeFormElement(output, el)">
                            fas fa-xmark
                          </v-icon>
                        </template>
                        {{ output.title}}
                      </v-chip>
                    </template>
                  </template>

                  <template v-else-if="el.input_type === 'checkbox'">
                    <v-checkbox v-model="el.value" density="comfortable"></v-checkbox>
                  </template>

                  <template v-else-if="el.input_type === 'multiselect'">
                    <v-responsive
                      max-width="350">
                      <v-select
                        density="comfortable"
                        :items="el.options"
                        v-model="el.value"
                        variant="outlined"
                      ></v-select>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'number'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        v-model="el.value"
                        type="number"
                        :rules="el.rules"
                        variant="outlined"
                      ></v-text-field>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'file'">
                    <v-responsive
                      max-width="350">
                      <v-file-input v-model="el.value" density="comfortable" variant="outlined" class="shrink mx-4"></v-file-input>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'password'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        v-model="el.value"
                        type="password"
                        variant="outlined"
                        class="shrink mx-4"
                      ></v-text-field>
                    </v-responsive>
                  </template>
                </template>
              </template>
            </div>
          </v-card-text>

          <v-card-actions style="border-top: 1px solid #969696">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="outlined"
              @click="canceldialogForm(elemForm)"
            >
              CANCEl
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              @click="submitForm(elemForm)">
              CONFERMA</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- FORM DIALOG ANNIDATO-->
      <v-dialog
        persistent
        v-model="dialogFormAnnidato"
        width="70vh"
        max-height="60vh"
      >
        <v-card max-height="70vh">
          <v-card-title>
            prova temporanea annidato  <!-- TODO: cambiare il titolo del form-->
          </v-card-title>

          <v-card-text max-height="50vh" style="overflow: auto">
            <div class="pa-5">
              <template v-for="(el) in elemFormAnnidato.form_inputs">
                <template v-if=" shouldShowElementForm(el)">
                  <p v-if="el.input_type !== 'btn'" style="font-weight: bold;">
                    {{ el.label }}
                    <span class="span_fieldID">{{ el.field_id }}</span>
                  </p>
                  <label class="label_desc" v-html="el.description"></label>
                  <br>

                  <template v-if="el.input_type === 'text'">
                    <v-responsive
                      max-width="350">
                      <v-text-field variant="outlined" density="comfortable" v-model="el.value"/>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'multitext'">
                    <v-responsive
                      max-width="350">
                      <!-- Dynamic Input Field -->
                      <v-text-field
                        density="comfortable"
                        v-model="el.dynamicInputValue"
                        @keydown.enter="addItem(el)"
                        placeholder="Aggiungere un elemento e premere Invio"
                      ></v-text-field>
                    </v-responsive>
                    <!-- List of Added elems -->
                    <div class="added-items-container">
                      <span class="added-item" v-for="(addedelem, addedIndex) in el.options" :key="addedIndex">
                        {{ addedelem }}
                        <v-icon @click="removeItem(el, addedIndex)">fas fa-xmark</v-icon>
                      </span>
                    </div>
                  </template>

                  <template v-else-if="el.input_type === 'checkbox'">
                    <v-checkbox v-model="el.value" density="comfortable"></v-checkbox>
                  </template>

                  <template v-else-if="el.input_type === 'multiselect'">
                    <v-responsive
                      max-width="350">
                      <v-select
                        density="comfortable"
                        :items="el.options"
                        v-model="el.value"
                        variant="outlined"
                      ></v-select>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'number'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        v-model="el.value"
                        type="number"
                        :rules="el.rules"
                        variant="outlined"
                      ></v-text-field>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'file'">
                    <v-responsive
                      max-width="350">
                      <v-file-input v-model="el.value" density="comfortable" variant="outlined" class="shrink mx-4"></v-file-input>
                    </v-responsive>
                  </template>

                  <template v-else-if="el.input_type === 'password'">
                    <v-responsive
                      max-width="350">
                      <v-text-field
                        density="comfortable"
                        v-model="el.value"
                        type="password"
                        variant="outlined"
                        class="shrink mx-4"
                      ></v-text-field>
                    </v-responsive>
                  </template>
                </template>
              </template>
            </div>
          </v-card-text>

          <v-card-actions style="border-top: 1px solid #969696">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="outlined"
              @click="canceldialogFormAnnidato(elemFormAnnidato)"
            >
              CANCEl
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              @click="submitFormAnnidato(elemFormAnnidato, elemForm)">
              CONFERMA</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-card-actions style="border-top: 1px solid #969696">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="outlined"
          @click="closeModal"
        >
          CANCEl
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="formValidation"
          @click="SavePayload"
        >
          SAVE
        </v-btn>
        <!-- TODO DISABLE BUTTON FORM VALIDATION TAB GENERAL MUST NOT BE EMPTY-->
      </v-card-actions>
    </v-card>

  </v-dialog>

</template>

<script>
import ConfigurePayload from "@/components/home/uemProfile/payloadComponents/ConfigurePayload.vue"
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: 'PayloadDialog',
  components: {ConfigurePayload},
  props: {
    title: String,
    isModalOpen: Boolean,
    tabs: Array,
    saving: Boolean,
    operatingSystem: String,
    payloadId: Number
  },
  computed: {
    languageChosen: {
      get() {
        // Use the languageChosen from the store
        return useAppStore().languageChosen;
      }
    },
  },
  data() {
    return {
      formValidation: false,
      localValue: false,
      selectedTab: 0,
      formupdate: false,
      formupdateAnnidato: false,
      currentOutputIndex: null,
      dialogForm: false,
      dialogFormAnnidato: false,
      elemForm: [],
      elemFormAnnidato: [],
      disableBtnForm: true,
      arraySectionsChanged: [],
      showConfigDialog: [],
      indexForm: 0,
      tabMixedOS: null,
      category: '',
    };
  },
  created() {
    this.localValue = this.isModalOpen;
  },
  methods: {
    isCategoryInOsTypes(category, osTypes) {
      return osTypes && osTypes.includes(category);
    },
    getFilteredItems(category) {
      if (!category) {
        return []; // Return an empty array if category is not set
      }
      // Filter the items based on the category
      return this.tabs[selectedTab].content.filter((item) => item.os === category);
    },
    checkIfShowConfig(item){
      return item.config['show'] !== false;
    },
    executeConfig(itemName){
      this.showConfigDialog[this.selectedTab] = false;
      this.tabs[this.selectedTab].config.show = false;
      this.arraySectionsChanged[this.arraySectionsChanged.findIndex(elem => elem.tab === itemName)].configured = true;
    },
    removePayloadFromProfile(itemName){
      this.showConfigDialog[this.selectedTab] = true;
      this.tabs[this.selectedTab].config.show = true;
      this.arraySectionsChanged[this.arraySectionsChanged.findIndex(elem => elem.tab === itemName)].configured = false;
    },
    //TODO: ottimizzare shouldShowElement e shouldShowElementForm
    canceldialogForm(item){
      this.currentOutputIndex = null;
      this.formupdate = null;

      // Reset form inputs
      item.form_inputs.forEach(input => {
        input.value = "";
      });

      this.dialogForm = false
    },
    canceldialogFormAnnidato(item){
      this.currentOutputIndex = null;
      this.formupdateAnnidato = null;
      // Reset form inputs
      item.form_inputs.forEach(input => {
        input.value = "";
      });

      this.dialogFormAnnidato = false
    },
    showdialogFormAnnidato(elem){
      this.elemFormAnnidato = elem;
      this.dialogFormAnnidato = !this.dialogFormAnnidato;
    },
    showDialogForm(elem){
      //console.log(elem)
      this.currentOutputIndex = elem.form_outputs.length + 1;
      //console.log("change max id")
      //console.log(elem)
      let maxId = -1; // Initialize with a low value

      for (const output of elem.form_outputs) {
        if (output.id > maxId) {
          maxId = output.id;
        }
      }
      this.indexForm = maxId+1;//todo: aggiornare

      this.elemForm = elem;
      this.dialogForm = !this.dialogForm;
      ////console.log(this.elemForm)

    },
    removeFormElement(item, elemForm){
      //TODO: gestire con l'id e non i title
      //console.log(item, elemForm)
      elemForm.form_outputs = elemForm.form_outputs.filter(el => el.id !== item.id)
    },
    editFormAnnidatoElement(output, index, item){
      this.elemFormAnnidato = item;
      this.dialogFormAnnidato = true;
      this.formupdateAnnidato = true;
      this.currentOutputIndex = index

      //this.indexForm = output.id;//todo: aggiornare

      // Split the content string into individual values
      const values = output.content;

      item.form_inputs.forEach((el, elIndex) => {
        if (el.input_type === 'checkbox') {
          el.value = values[elIndex].value === 'true';
        } else {
          el.value = values[elIndex].value || '';
        }

      });
      console.log(this.indexForm, output, item)
    },
    editFormElement(output, index, item){
      this.elemForm = item;
      this.dialogForm = true;
      this.formupdate = true;
      this.currentOutputIndex = index
      this.indexForm = output.id;
      // Split the content string into individual values
      const values = output.content;

      item.form_inputs.forEach((el, elIndex) => {
        if (el.input_type === 'checkbox') {
          el.value = values[elIndex].value;
        } else {
          el.value = values[elIndex].value || '';
        }
      });
      console.log(output, index, item)
    },
    submitFormAnnidato(item, el) {
      //TODO: check form vuoto (CONTROLLI VARI)
      // Create a new output object based on the entered form data

      const newOutput = {
        //TODO: cambiare title con id
        id: item.form_outputs.length + 1,
        idElem: 0, // id dell'elemento padre
        title: item.form_inputs[0].value,
        content: item.form_inputs.map(input => ({ id: input.id, value: input.value }))
      };

      if(this.formupdateAnnidato){
        //update the form_outputs
        item.form_outputs[this.currentOutputIndex] = newOutput;
        this.formupdateAnnidato = false;
      }else{
        // Add the new output to form_outputs
        item.form_outputs.push(newOutput);
      }

      // Reset form inputs
      item.form_inputs.forEach(input => {
        input.value = "";
      });

      this.dialogFormAnnidato = false;
    },
    submitForm(item) {
      //TODO: check form vuoto
      // Create a new output object based on the entered form data

      let idFormOutputs = 0;

      if(this.formupdate){
        //update the form_outputs
        idFormOutputs = this.indexForm;
        item.form_outputs[this.currentOutputIndex] = {
          id: idFormOutputs,
          title: item.form_inputs[0].value,
          content: item.form_inputs.map(input => ({id: input.id, value: input.value}))
        };
        this.formupdate = false;
      }else{
        const newOutput = {
          id: item.form_outputs.length +1,
          title: item.form_inputs[0].value,
          content: item.form_inputs.map(input => ({ id: input.id, value: input.value }))
        };
        // Add the new output to form_outputs
        item.form_outputs.push(newOutput);

        idFormOutputs = item.form_outputs[item.form_outputs.length - 1].id;
      }

      //faccio l'update dell'id associato a outputs dei form annidati
      // dove l'id è 0, metto l'id dell'elemento del form
      item.form_inputs.forEach((elem) =>{
        if(elem.input_type === 'form'){
          elem.form_outputs.forEach((output) => {
            if (output.idElem === 0) {
              output.idElem = idFormOutputs
            }
          })
        }
      })

      // Reset form inputs
      item.form_inputs.forEach(input => {
        input.value = "";
      });

      this.dialogForm = false;
    },
    addItem(item) {
      if (item.dynamicInputValue.trim() !== '') {
        item.options.push(item.dynamicInputValue);
        item.dynamicInputValue = ''; // Clear the input field
      }
    },
    removeItem(item, index) {
      item.options.splice(index, 1);
    },
    closeModal() {
      this.selectedTab = 0;

      this.$emit('close-modal');
    },
    shouldShowElementForm(item) {
      if (!item.dependable) {
        return true; // Show the element if no dependable property
      }

      const idToCheck = item.dependable.id;
      const correspondingDependency = this.tabs[this.selectedTab].Fields[0].form_inputs.find(depItem => depItem.id === idToCheck);

      if (!correspondingDependency) {
        return false; // Hide the element if the dependency item doesn't exist
      }

      if (correspondingDependency.input_type === 'multiselect') {
        // Check if the selected value matches the dependency's value
        if (correspondingDependency.value !== item.dependable.value) {
          return false;
        }
      } else if (!correspondingDependency.value) {
        return false;
      }

      // If the dependency is met, recursively check for dependencies of the dependent element
      if (item.dependable.id) {
        const dependentItem = this.tabs[this.selectedTab].Fields[0].form_inputs.find(dItem => dItem.id === item.dependable.id);
        return this.shouldShowElement(dependentItem);
      }

      return true;
    },
    shouldShowElement(item) {
      if (!item.dependable) {
        return true; // Show the element if no dependable property
      }

      const idToCheck = item.dependable.id;
      const correspondingDependency = this.tabs[this.selectedTab].Fields.find(depItem => depItem.id === idToCheck);

      if (!correspondingDependency) {
        return false; // Hide the element if the dependency item doesn't exist
      }

      if (correspondingDependency.input_type === 'multiselect') {
        // Check if the selected value matches the dependency's value
        if (correspondingDependency.value !== item.dependable.value) {
          return false;
        }
      } else if (!correspondingDependency.value) {
        return false;
      }

      // If the dependency is met, recursively check for dependencies of the dependent element
      if (item.dependable.id) {
        const dependentItem = this.tabs[this.selectedTab].Fields.find(dItem => dItem.id === item.dependable.id);
        return this.shouldShowElement(dependentItem);
      }

      return true;
    },
    getCurrentDateTime() {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1
      const year = now.getFullYear();

      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    },
    SavePayload(){
      this.selectedTab = 0;

      const configuredTabNames = this.arraySectionsChanged.filter(tab => tab.configured === true).map(tab => tab.tab);
      const newPayload = this.tabs
        .filter(tab => configuredTabNames.includes(tab.name))
        .map(tab => ({
          PayloadName: tab.name,
          icon: tab.icon,
          Fields: tab.Fields,
          config: tab.config
        }));

      newPayload.unshift(
        {
          "id":this.payloadId ,
          "name":newPayload[0].Fields[0].value,
          "description":newPayload[0].Fields[2].value,
          "operatingSystem": this.operatingSystem,
          "datetime": this.getCurrentDateTime() //date time
        }
      )

      if(this.saving){
        this.$emit('SavePayload', newPayload);
      }else{
        this.$emit('NewPayload', newPayload);
      }
      this.closeModal()
    }
  },
  watch:{
    isModalOpen(newVal){
      this.localValue = newVal
    },
    tabs(){
      this.tabs.forEach((tab, index) => {
        this.showConfigDialog[index] = tab.config !== false;
      });

      this.arraySectionsChanged = this.tabs.map(tab => {
        //tab generale
        if(tab.name === "Generale"){
          return {
            tab: tab.name,
            configured: true
          };
        }

        if(tab.config['show'] === false){
          return {
            tab: tab.name,
            configured: true
          };
        }else{
          return {
            tab: tab.name,
            configured: false
          };
        }
      });
    }
  }
};
</script>

<style scoped>
*{
  font-size: 13px;
}

.icons{
  margin-right: 2vh;
  font-size: 20px
}

.span_fieldID{
  font-size: 11px;
  color: #e7e7e7;
}

.label_desc{
  font-size: 12px;
  color: #76828e;
}

.v-card-title{
  margin-top: 5px;
  font-weight: 700;
  color: #e7e7e7;
  display: block;
  font-size: 20px;
  padding: 9px;
  border-bottom: 1px solid #969696;
}

.scrollable-panel-content {
  max-height: 700px;
  overflow-y: auto;
}
.scrollable-panel-text {
  max-height: 70vh;
  height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.scrollable-panel {
  max-height: 70vh;
  overflow-y: auto;
}
.added-items-container {
  display: flex;
  flex-wrap: wrap;
}

.added-item {
  margin-right: 2vh;
  margin-bottom: 3vh;
  border: 1px solid;
  border-radius: 10px;
  padding: 0.7vh;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
