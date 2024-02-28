<template>
  <div>
    <v-card>
      <slot name="clear"></slot>
      <v-card-title class="py-0">
        <v-alert
          dense
          icon="mdi-information-outline"
          outlined
          prominent
          type="info"
          color="primary"
          style="width: 100%"
          class="mt-3"
        >
          {{
            getTranslation('SECURITY_POSTURE') + ' ' + getTranslation('OF') + ' ' + (deviceName ?? deviceSerialNumber)
          }}
        </v-alert>
      </v-card-title>
     <GaugeChart
        :value="score"
        :loadingData="loadingData"
      />
      <v-skeleton-loader
        v-if="loadingData"
        class="pt-5 mx-5"
        elevation="12"
        max-width="90%"
        max-height="300"
        type="table-heading, list-item-two-line, image, table-tfoot"
      ></v-skeleton-loader>

      <div v-else class="px-5 mt-3">
        <v-divider/>
        <div class="mt-3 mb-3" style="text-align: center; font-size: 18px; color: #63adf2">
          {{ getTranslation('NUMBER_OF_EVENTS_NOT_RESOLVED') }}
        </div>
        <v-row>
          <v-col>
            <v-text-field
              :model-value="criticEvents"
              :label="getTranslation('CRITIC_EVENTS')"
              class="text-field-critic"
              hide-details="auto"
              prepend-icon="mdi-alert-decagram"
              outlined
              readonly
            />
            <v-text-field
              class="mt-2 text-field-medium"
              :model-value="mediumEvents"
              :label="getTranslation('MEDIUM_EVENTS')"
              hide-details="auto"
              prepend-icon="mdi-alert-circle"
              outlined
              readonly
            />
          </v-col>
          <v-col>
            <v-text-field
              :model-value="highEvents"
              :label="getTranslation('HIGH_EVENTS')"
              class="text-field-high"
              hide-details="auto"
              prepend-icon="mdi-alert-octagon"
              outlined
              readonly
            />
            <v-text-field
              class="mt-2 text-field-low"
              :model-value="lowEvents"
              :label="getTranslation('LOW_EVENTS')"
              hide-details="auto"
              prepend-icon="mdi-alert-circle-outline"
              pre
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <v-divider/>
        <div class="mt-3 mb-3" style="text-align: center; font-size: 18px; color: #63adf2">
          {{ getTranslation('NUMBER_OF_VULNERABILITIES_NOT_RESOLVED') }}
        </div>
        <v-row>
          <v-col>
            <v-text-field
              :model-value="criticCves"
              :label="getTranslation('CRITIC_VULNERABILITIES')"
              class="text-field-critic"
              hide-details="auto"
              prepend-icon="mdi-alert-decagram"
              outlined
              readonly
            />
            <v-text-field
              class="mt-2 text-field-medium"
              :model-value="mediumCves"
              :label="getTranslation('MEDIUM_VULNERABILITIES')"
              hide-details="auto"
              prepend-icon="mdi-alert-circle"
              outlined
              readonly
            />
          </v-col>
          <v-col>
            <v-text-field
              :model-value="highCves"
              :label="getTranslation('HIGH_VULNERABILITIES')"
              class="text-field-high"
              hide-details="auto"
              prepend-icon="mdi-alert-octagon"
              outlined
              readonly
            />
            <v-text-field
              class="mt-2 text-field-low"
              :model-value="lowCves"
              :label="getTranslation('LOW_VULNERABILITIES')"
              hide-details="auto"
              prepend-icon="mdi-alert-circle-outline"
              pre
              outlined
              readonly
            />
          </v-col>
        </v-row>
        <div v-if="hardeningActions.length > 0" class="mt-3 mb-3"
             style="text-align: center; font-size: 18px; color: #63adf2">
          <v-divider class="my-2"/>
          {{ getTranslation('HARDENING_ACTIONS') }}
        </div>
        <v-list
          v-if="hardeningActions.length > 0"
          :items="hardeningActions"
          class="mx-auto"
          style="max-height: 300px; overflow-y: scroll"
        >
          <v-list-item v-for="(item, i) in hardeningActions" :key="i"
                       style="border-color: #63adf2; border-style: solid;">

            <v-list-item-content>
              <v-list-item-title>
                {{ getTranslation(item.remediationAction) + (!!item.subject ? ' (' + item.subject + ')' : '') }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn
                depressed
                small
                @click="itemRepairDialog = {
                    id: item.id,
                    remediationAction: item.remediationAction,
                    deviceName: deviceName,
                    serialNumber: deviceSerialNumber,
                    description: item.description,
                    subject: item.subject
                  }; repairDialogOpened = true;"
              >
                {{ getTranslation('REPAIR') }}
                <v-icon
                  color="#63adf2"
                  right
                >
                  mdi-open-in-new
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider class="my-2"/>
        <v-skeleton-loader
          v-if="linkedApps && loadingApps"
          class="pt-5 mx-5"
          elevation="12"
          max-width="90%"
          max-height="300"
          type="table-heading, list-item-two-line, image, table-tfoot"
        ></v-skeleton-loader>
        <div id="listAppSection" v-if="linkedApps && !loadingApps">

          <div class="d-flex flex-sm-wrap flex-xl-nowrap align-center justify-center">
            <div style="font-size: 18px; color: #63adf2">
              {{ getTranslation('LIST_APPS') }}
            </div>
            <v-text-field
              id="textFieldAppSearch"
              v-model="search"
              style="margin-left: 20px"
              append-icon="mdi-magnify"
              clearable
              :label="getTranslation('SEARCH')"
            />
            <v-spacer></v-spacer>
            <v-btn color="primary" v-if="ignoreAppServices" :loading="loadingApps"
                   @click="ignoreAppServices = false; fetchDeviceApps();">
              <v-icon class="mr-1">
                mdi-cellphone-cog
              </v-icon>
              {{ getTranslation('LOAD_ALSO_SERVICE_APPS') }}
            </v-btn>
            <!--poi quardo il funzionamento di questo bottone javid -->
          </div>
          <v-data-table
            :headers="headers"
            :items="linkedApps"
            :search="search"
            :item-class="rowTableClasses"
            :expanded.sync="expandedRows"
            show-expand
            single-expand
            mobile-breakpoint="0"
            item-key="Identifier"
            @click:row="expandRow"
            :custom-filter="customSearch"
          >
            <template #header.appPermissionsScore>
              {{ getTranslation('SCORE') }}
            </template>
            <template #header.appName>
              {{ getTranslation('APP_NAME') }}
            </template>
            <template v-slot:item.icon="{ item }">
              <div class="d-flex align-center py-3">
                <div>
                  <v-avatar
                    size="48px"
                  >
                    <img
                      v-if="item.icon"
                      alt="Avatar"
                      :src="'data:image/png;base64,' + item.icon"
                    >
                    <v-img
                      v-else
                      :src="'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAA8PSURBVHja7F09l5y4Eq3XrzO/HHJvDPnmjf8EkG/ckDsH/wno3HGLXyFy55Dbcb9g9uoIhm+VoD1unTPn7I6naaSrKtXHrRIFQfCQUj6GRpZlj/v9/thzSCkfWZZZeXZRFNbmc8Ra3e/30bWSUj6CIHicsiyjPM+prmt6jY8x6rqmPM8pyzI6eZ5HSZK8QP5g4CZJQp7n0YmI6AXyxwSXiN4AfoH8McHtADwEsv6HrzE9HMc55Hs9zxsFl4joPPQBgExElCTJC70nHa7rdnAaEsgz/qAPMhFRWZYkpaQsy3ZR247jUFVVJKVU/9+27WKJadu280NE1DRNR43p88Mi4Xn6z9Czp94jz3Pyfb/z3bYlN01TquuaoiiipmlICPEe4DE1nCQJSSmprmtq25aCIOgslq0dicXxPI9c1+18J8AAcG3bqvcbWlQdLGwWx3EoCILO3/c3hf5Zz/PIcRzyfb/z3f3h+z55nke+7++yTsAGGrdpmkEJ/s/j8XiMPUgIoSYeRdEu50zbtiSEoCiKRo0JKaUCC2C4rjsqffp8XNedtC0wX2wgopbalhTIY58ty3Ly37nXqCxLNd8gCEb/9jxnmQVBQI7jUBzHlGWZtQkAsCFpFEIoSdUnNQfo0Hzatp2cgy65OuBSShJCqIX1PK+zsNgUnud1Np8NazlNUyqKQgnDZoChjjzPI0S8xg5zTisUQEspqaoqtaC+7xst3NoNMQY41GNVVeR5ntJu+nluO0LlOI6yVabGeenDdevaFsjYULqbFkXRU7lr0B5BEKjjIk1TEkJY1XBTrhALwLZBhrq53W7KyDvKt1yzHlDJUJ0wSDnffSu47wIda0Hmcp2EEJSmKRERXa/X3wLcvlSHYahiBpDoo8HdBDAnyNj1dV1TkiQURVHHVfqdRtu25Ps+RVGk4gaY21HgbgaYA+SyLCnPc7pcLlbP9D0H/F/HcShJErpcLpTnOZVleQi4RgBvBbltW3VWFUUxaeL/7iMIAuXOYM57gmsM8FqQcdZCav+UAWlecjZzgssC8FKQy7Kk2+1GSZJ8aKmdkuYsyeh2u42qbG5w2QCeAxm/K4rij05BOp5DRVEoIG2DywrwGMhwf7Iso9egzlpgbWyBuzrQsRbktm3per3+kSp5ybkshKAvX74oq9uGdjvZeHlEd4QQnTTba3SH7/sqY2fr6LICcJqmFIYhNU1j7Ox/1IFASNM0FIahUtdPD3Ce5+Q4jsqwvIh809ayvlZD7JqnArgsS2rbtuPjvtiay1yhJElUIv8pjSwhBFVVRUVRTBpee4Ql+6wMRJDKslSxbp08sIQNYhNc3bqO43iWpbE7wG3bqiDGEuvaBsjIzUJL6HQe8LvqulbUG53TBaYH3tMG9WapK4Q1MiU3sAKc5zmFYTi7KNwg66BCAnGeDS3O5XJRgPe/e4iawwX2Gj/X8zwKw1AxNw4HGBylpSqFA+S6rjvuBUf+eIiao3OwgiDY/K5r5wq2SFmWo+TDXQAGL2no3LUBsg7s5XKxGkCBNoB9sQVokwhVkiQUx7GxBjmZSm8YhsYRryXWdVmWSm1mWbZrdCwIAsW3wnvYBBcjDENjq3ozwEIIY2tvCcg612lvYMeARn536p057Axwu0zoP4sB7lcC3G43lsUGyABRP0uFEB3WR/89tlr8pp/V2Rr64sMFS9OUzVMIgoBut9u79V86Jisbxtj6UBumBkB/8QCmbtVyEgMABqcWQOQOXG7wyzh96rH1hhcxhcN56vyrqqpTcUD0xju63W50vV5ZI1OO49DlcqE4jlWpDKI7XCQ8kOhRJMbxzkEQdHhX9/tdLT7n2nz79u0duR4VH1MJnfOUfgdzHparHi/FbuUcyEJhNE1DpRDkMC0SapOmqha3vHP/BbnDjY7jqMQNNr3jOEqCpzA8z6lAvQbHlgrSF0ZXN67rUvZvJSDn93EcLXgnIQRR+/ZMG8eKfhbned4h1cNvn/q+89zO0Us2pZSqnJJ7QEugFNJ1XQU4Z9iQ690hQVVVqXfWfXVuax9gSinVs5dwyE9zu1Svda2qykoCv65rFctGETjqkrizUFycerhC2IB1XZPrupQkCd1uNyuZM9/3qaqqzhFmBPCQ32sjE6QHTHSjzkaqkUOAx/xcCANHgGLsuFzrF5/WTMoWuEMBE6jSZ8snLwli4Jy0BfKadZgFGGcwam+4FwtGG2dY80hwMZIkUfPjVtNQy7p9ZCTBejqO27DSAxvPDPKW8OPlcmGrMtQ1Gww8NhUtpWQHV2/ustS6PQrkrbFlNHvhftel1f2zAMPBtqGedeldewbtCbJp4sCGFENNN00zKxizEqxzl2xJ77OCzJEVsiHFeuzbWEX3OU4cAwETU2vSJsic5SQIUHAHa5bMe7EEcy8eZ6qRG2TuWiFQcLjPYRYJbtt2kTm+ZvE4VT43yDYKwdZavkvG0lYXs6FKG+qZWyNw9gyxRetdY/muUdPGsWhugOfyl0eBbBNcWL7chhYbwFzDxobhANk2uGsA2bqmTwOw7RKRtSDvAe5a12Y3gLmlzXab3bUg7wWurTVYgs1pT0BsdmFdCjJ2/BHg2pDgOYxOtOPYE+A+yPrxAAbn3g3YbABs7AdzA7LEp+b8Tr0VMkKkeZ5Txgxun960de7cKvo8lZTGglwuFxWgMBllWVJd16NJBtB1bKXY9I4/smmoZfRL8/xGvl9RGIajUor7KEzXEWwXFNxPYXie+zLsTA71OlVorbtQOvf3rZ0+r2s29t9mc5t/rl5szqEJ9XsoRgGeigmDMjtUT7t1seeq5VD4bKNqAp3SbVB/l8wNl2lwMS7xnKnnnZZKANcizFl93NfSoHgtiRJFWkMtFC9bc35uS1iQnD7w7lb03lZkp5uN53R6cxzBDNnbi5gF2IbVtxfAY37ukWxNGwDPYbSriubeMKYRqiNA5lwDYxXNvdvG7kU6Aty9QdaPhz194d0B5tYKJuDuCbKtTBoLwJyAcPOTTMHdC2QOHtqWDbM7wFzF15zg7gEyN/WYBWA8gDOrhCJvLpC5s0I2QMZ8OSV4CSd6McDcEud5Hku82VbKjxtkIQR71mqpwXZaMlkbatp04WznczlB5uah6X012SSY29Ay6f+0V7KeA2QbddVrXK5ZThayFtyWbxAEnWr1ZwOXC+SqqtjbOSDlaNzCwabl25fiJc8/gmZjArKtrghrLPLT0gnaiEDpUjynbo4C1wRkG9K71iKfBVi/cJFbTSPPPHdXwdHgbgE5z3O2PPqQetaxMZZgTM5GhAf9pfoG15HsR1OQ0RKKk7Sgb/Y167AYYFvV6gAZN3/rNBQb4HKcMmMgI1N0u92sgbu2rvq/X79+/Tr2jz9+/KC//vqrcz7++PGDvbbIcRz69OkTff/+XVntv379orIs6Z9//mED9404+D/6/Pkzyzt//vxZXfTx6dMn+vnzJ33//p0ulwv9/fff7AAjYIL3//XrF/38+XO6V+Xcgd40jVpg3/c7HGNugwvcKQxILuf3cRmKMHTQVhi/C8PQSk9rvY2kbh/Nzec8ZeCgnbDuWAshSAihmmJyn29669ymaagsBUvzMjRS1dtCcb0z1oqI6Hq9sl9wpTeB1Tc8aLiTAE/tNhzokC6iN04xWttyqmpY6Xrs+601IJ8PjgZl+nxM33noOTAcuQZ6d16v1x6luFXzGhvP0xC8bikvP0JD8JaSJHqahuCLm5HqOxIBCi6Luq5ritOYkiRRiQg0+YzjuONCmbbk52jpj80Sx7FqmoqEQpJEFMcx69r0AyZ6c3a2ZqR91n4YhqwpP5DS+xspSRKqqkqdQRz3I5l+Ns9z1UZYX3jkaPVaKA6tE4bh5mqMzbxonGMmIC/xc1E8htoi7rqltYudpqkCceqdOVKNCJiYHClGxHc9QGED3P53QRXuDTSAxdGxxPbgAJkjYGJ085nuB64xhkzYjwiZ4rZTWPncfjm0E6oqt3SeN7nGDzfQmAZ5jO8ujKJISdQSVcIRftSBllJ2LFkUr60FXL+cUs/YmF4psAVk/XoD08Fy+yiKuVzfJc/xrII7BLTuMsCl0C+uQHIc1+q4rvvubmGdBrP1IkoOkOv67dIxjptH2QCGVZ2n+ehFlXtwqHT+mH5BNBpzSylVCSeiQbhbeM/uP1NrkOfpO6v5cIB1qzpN03e7b++UX/+q2P7vj7r/cA7kNE3Zb1VlLR/F5cx6LPbZ8rlHjzHrGnYEd5qRvT4YSQj0j3iBOw0yrHVbF2qdbUwgyzL68uULxXG8mIH/J4KcZRm5rktBEKg7D7mHlQp/+I5BEFgpNPsoA/06uFsNWwVYP3Pv93snjvwa3UBGVVV0v9+tVjWebIGLMxcWNXpUvQZ1+nVNGV5PBfCUtYzfcabRfsfR1q1KMfYNKlsgn2yDq7tQYRi+uxb9TxlCCEr/DWKMuUI2QD7tAa4eDMmy7I87l3HeZlk2G8TgBvm0F7h6NAn53T5b4yNKbRzHnTmbBEN29YNNI1RRFJHv+6pBKXeA/4ihMzbzvCSilqVniEmg6HwEuH1nXwih8p+2g/62BlihUkqqqoqFH80B8ukocIfOZiKib9++qRDeb2Mdt28pPtgVS87aLSBvUdfno8HVJQDJijRNVXXeXAfXIwdSkHVdU9M0rMBySfL5GcDtn2NgKyKBj9Qf2BpHSytABesDBDybrRq3gnxesuB6ntcWuHr9Ef47CAIKgkBxo8DI2ErN2aL2h6g82HB9rjLquGx1lQXIaZpSURTkuu6s2j7PPRATK4rCqvT0KTb9MxqLCbWI9gj4zBJWxhIp67NB+htubIP3O9XblOSiKDqabRLgMT/UdV1FFS2KQu1i226GzmQEd6rvhvi+36HjjFUs9MniWJR+bdLYZ7GA+sbAedsfVVV1Kg5srxPiCHi3se88D4k42iqg+Myk5dFadQgJHeoLor+r3ve5L336jz7xoY2gS53+M/ReU5oHm3+PntjABczSPM8pDMPhd3wMDCnlI4qiRxRFDynlY88hpXxkWWbl2UVRPO73+2/37Km1msPpNGUth2G423V0r7F+NE1DYRhO+smnKVfoT07tbTlejvLFp4Ihp7393New7yfrIJ9e4H5skE8vcD82yKc0TV/gflCQ0zSl/w8AdLeviMHPkogAAAAASUVORK5CYII='"
                    >
                    </v-img>
                  </v-avatar>
                </div>
              </div>
            </template>
            <template v-slot:item.appName="{ item }">
              <strong :ref="'ref_permission_name_'+ item.Identifier">{{ item.Name ?? item.Identifier }}</strong>
            </template>
            <template v-slot:item.appPermissionsScore="{ item }">
              <v-text-field
                v-if="item?.permissionsScore?.score != null"
                :class="{
                            'security-text-field-1': item.permissionsScore.score < 30,
                            'security-text-field-2': item.permissionsScore.score >= 30 && item.permissionsScore.score < 50,
                            'security-text-field-3': item.permissionsScore.score >= 50 && item.permissionsScore.score < 70,
                            'security-text-field-4': item.permissionsScore.score >= 70 && item.permissionsScore.score < 90,
                            'security-text-field-5': item.permissionsScore.score >= 90 && item.permissionsScore.score <= 100
                          }"
                :value="item.permissionsScore.score.toFixed(2) + '%'"
                style="max-width: 120px;"
                outlined
                hide-details="auto"
                prepend-icon="mdi-security"
              />
            </template>
            <template v-slot:expanded-item="{ headers,item }">
              <td colspan="12" class="py-5" style="max-width: 800px">
                <v-row>
                  <v-col sm="4">
                    <v-text-field
                      :model-value="item.Identifier"
                      readonly
                      outlined
                      :label="getTranslation('IDENTIFIER')"
                      prepend-icon="mdi-identifier"
                    />
                  </v-col>
                  <v-col sm="4">
                    <v-text-field
                      :model-value="item.shortVersion ?? item.ShortVersion"
                      readonly
                      outlined
                      :label="getTranslation('VERSION')"
                      prepend-icon="mdi-counter"
                    />
                  </v-col>
                  <v-col sm="4">
                    <v-text-field
                      :model-value="item.installDate ?? 'NOT_FOUND'"
                      readonly
                      outlined
                      :label="getTranslation('INSTALL_DATE')"
                      prepend-icon="mdi-calendar"
                    />
                  </v-col>
                </v-row>
                <div v-if="item?.permissionsScore?.score != null" class="pt-3 px-0">

                  <div class="mb-2" style="font-size: 16px; color: #63adf2"
                       v-if="!!item.permissionsScore.permissionsActiveList && item.permissionsScore.permissionsActiveList.length > 0">
                    {{ getTranslation('ACTIVE_PERMISSIONS_LIST') }}
                  </div>
                  <v-list
                    :style="{'max-height': '30vh','overflow-y': 'scroll',
                       'border':item?.permissionsScore?.permissionsActiveList && item.permissionsScore.permissionsActiveList.length > 0 ? '2px solid #63adf2': ''}"
                  >
                    <v-list-item
                      v-for="(appPermission, index) in item.permissionsScore.permissionsActiveList"
                      :key="index"
                    >
                      <v-list-item-avatar>
                        <v-icon
                          color="primary"
                        >
                          {{ getAppPermissionIcon(appPermission) }}
                        </v-icon>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title>{{ getTranslation(appPermission) }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
              </td>
              <td></td>
            </template>
            <template v-slot:item.data-table-expand="{ item }">
              <v-icon v-if="!item.checked">
                mdi-arrow-down
              </v-icon>
              <v-icon v-if="!!item.checked">
                mdi-arrow-up
              </v-icon>
            </template>
          </v-data-table>
          <div>1</div>
        </div>
        <div v-if="!linkedApps" class="d-flex justify-center">
          <v-btn
            color="primary"
            class="mb-3"
            @click="overrideLoadLinkedApps = true; fetchData()"
          >
            {{ getTranslation('LOAD_APPS') }}
          </v-btn>
        </div>
      </div>
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

import GaugeChart from "@/components/home/dashboard/GaugeChart.vue";
import axios from "axios";
import translateService from "@/globalServices/translate";
import RepairDialog from "@/components/common/RepairDialog.vue";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "DetailDevice",
  components: {RepairDialog, GaugeChart},
  data: () => ({
    isOpen: false,
    loadingData: false,
    loadingApps: false,
    criticEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    criticCves: 0,
    highCves: 0,
    mediumCves: 0,
    lowCves: 0,
    score: 0,
    hardeningActions: //[],
      [{deviceSerialNumber:"shamsi",remediationAction:"kirekhar",subject:"dasbagh"},
        {deviceName:"javid",remediationAction:"kirekhar",subject:"dasbagh",description:"kossenanaat"}],
    repairDialogOpened: false,
    itemRepairDialog: undefined,
    linkedApps: undefined,
    ignoreAppServices: true,
    search: '',
    headers: [
      {text: '', value: 'icon', sortable: false, width: '10%'},
      {text: 'APP_NAME', value: 'appName', sortable: false, width: '*'},
      {text: 'SCORE', value: 'appPermissionsScore', sortable: false, width: '150px'},
      {text: '', value: 'data-table-expand'},
    ],
    expandedRows: [],
    customSearch(value, search, item) {
      return (
        (!!item.Identifier ? item.Identifier.toString().toLowerCase().includes(search) : false) ||
        (!!item.Name ? item.Name.toString().toLowerCase().includes(search) : false)
      )
    },
    overrideLoadLinkedApps: false,
  }),
  props: {
    deviceSerialNumber: {
      type: String,
      default: undefined
    },
    deviceName: {
      type: String || null,
      default: null
    },
    loadLinkedApps: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchDeviceSecurityPosture() {
      axios.defaults.withCredentials = true;
      try {
        this.loadingData = true;
        const response = await apiService.axiosToBackend()
          .get(`/api/device/securityPosture/${this.deviceSerialNumber}`);

        if (response.data?.success) {
          let payload = response.data.payload;
          this.criticEvents = payload?.eventCountCriticality.find(el => el.criticalityLevel === 'critic')?.num ?? 0;
          this.highEvents = payload?.eventCountCriticality.find(el => el.criticalityLevel === 'high')?.num ?? 0;
          this.mediumEvents = payload?.eventCountCriticality.find(el => el.criticalityLevel === 'medium')?.num ?? 0;
          this.lowEvents = payload?.eventCountCriticality.find(el => el.criticalityLevel === 'low')?.num ?? 0;
          this.criticCves = payload?.cveCountCriticality.find(el => el.criticalityLevel === 'critic')?.num ?? 0;
          this.highCves = payload?.cveCountCriticality.find(el => el.criticalityLevel === 'high')?.num ?? 0;
          this.mediumCves = payload?.cveCountCriticality.find(el => el.criticalityLevel === 'medium')?.num ?? 0;
          this.lowCves = payload?.cveCountCriticality.find(el => el.criticalityLevel === 'low')?.num ?? 0;
          this.score = Number(payload.score);
          this.hardeningActions = payload.hardeningActions;
        } else {
          throw new Error("Cannot find device security posture information");        }
        this.loadingData = false;
      } catch (e) {
        console.error(e);
        utilsFunctions.handleServerResponseException(e);
      }finally {
        this.loadingData = false;
      }
    },
    test(e) {
      console.log(e)
    },
    async fetchDeviceApps() {
      this.linkedApps = [];
      axios.defaults.withCredentials = true; //NON LO SO PERCHE CI SERVE
      try {
        this.loadingApps = true;
        const response = await apiService.axiosToBackend().get(`/api/device/apps/${this.deviceSerialNumber}`, {
          params: {
            filters: JSON.stringify({
              ignoreAppServices: this.ignoreAppServices
            })
          }
        });
        /*const response2 = await axios
          .get(process.env.VUE_APP_BASEURL + "/api/device/apps/" + this.deviceSerialNumber, {
            params: {
              filters: {
                ignoreAppServices: this.ignoreAppServices
              }
            }
          })*/
        if (response.data?.success) {
          this.linkedApps = response.data.payload;
        } else {
          console.error('Risposta inaspettata:', response.data);
          console.log('Risposta ricevuta:', JSON.stringify(response.data));
          throw new Error("Cannot find devices");
        }
        this.loadingApps = false;
      } catch (e) {
        this.loadingApps = false;
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.loadingApps = false;
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    getAppPermissionColor(score) {
      if (score >= 90 && score <= 100)
        return "#0f9747";
      else if (score >= 70 && score < 90)
        return "#54b947";
      else if (score >= 50 && score < 70)
        return "#CBAE00";
      else if (score >= 30 && score < 50)
        return "#f04922";
      else
        return "#ee1f25";
    },
    rowTableClasses(row) {
      let classes = [];
      classes.push('row-list-apps');
      if (!!row.checked)
        classes.push('row-checked-list-apps');
      return classes.join(" ");
    },
    getAppPermissionIcon(permissionKey) {
      let icons = {
        "READ_CALENDAR": "mdi-calendar-check",
        "WRITE_CALENDAR": "mdi-calendar-edit",
        "READ_CONTACTS": "mdi-account-box",
        "WRITE_CONTACTS": "mdi-account-box-outline",
        "GET_ACCOUNTS": "mdi-account-multiple",
        "ACCESS_FINE_LOCATION": "mdi-map-marker-check",
        "ACCESS_COARSE_LOCATION": "mdi-map-marker-radius",
        "RECORD_AUDIO": "mdi-microphone",
        "READ_PHONE_STATE": "mdi-cellphone",
        "READ_CALL_LOG": "mdi-history",
        "CALL_PHONE": "mdi-phone",
        "WRITE_CALL_LOG": "mdi-history",
        "CAMERA": "mdi-camera",
        "SEND_SMS": "mdi-message-text",
        "RECEIVE_SMS": "mdi-message-text",
        "READ_SMS": "mdi-message-text",
        "RECEIVE_WAP_PUSH": "mdi-message-text",
        "READ_EXTERNAL_STORAGE": "mdi-folder-multiple",
        "WRITE_EXTERNAL_STORAGE": "mdi-folder-multiple-outline"
      };
      return icons[permissionKey] ?? 'mdi-help-circle-outline';
    },
    expandRow(rowClicked) {
      let isRowExpanded = this.expandedRows.find(row => row.Identifier === rowClicked.Identifier);
      if (!!isRowExpanded) {
        this.expandedRows = this.expandedRows.filter(row => row.Identifier !== rowClicked.Identifier);
        rowClicked.checked = undefined;
      } else {
        this.expandedRows.push(rowClicked);
        rowClicked.checked = true;
      }
    },
    fetchData() {
      if (!!this.deviceSerialNumber)
        this.fetchDeviceSecurityPosture();
      if (this.loadLinkedApps || this.overrideLoadLinkedApps)
        this.fetchDeviceApps();
    }
  },
  watch: {
    deviceSerialNumber(newVal) {
      this.ignoreAppServices = true;
      this.fetchData();
    }
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
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

.security-text-field-1 {
  ::v-deep {
    fieldset {
      color: #ee1f25 !important;
    }

    .v-icon {
      color: #ee1f25 !important;
    }
  }
}

.security-text-field-2 {
  ::v-deep {
    fieldset {
      color: #f04922 !important;
    }

    .v-icon {
      color: #f04922 !important;
    }
  }
}

.security-text-field-3 {
  ::v-deep {
    fieldset {
      color: #CBAE00 !important;
    }

    .v-icon {
      color: #CBAE00 !important;
    }
  }
}

.security-text-field-4 {
  ::v-deep {
    fieldset {
      color: #54b947 !important;
    }

    .v-icon {
      color: #54b947 !important;
    }
  }
}

.security-text-field-5 {
  ::v-deep {
    fieldset {
      color: #0f9747 !important;
    }

    .v-icon {
      color: #0f9747 !important;
    }
  }
}

::v-deep {
  .row-checked-list-apps {
    background-color: #63adf2 !important;
  }

  .row-list-apps {
    cursor: pointer;
  }
}
</style>
