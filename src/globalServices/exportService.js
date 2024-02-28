import * as am5plugins_exporting from "@amcharts/amcharts5/.internal/plugins/exporting/Exporting";
import translateService from '@/globalServices/translate'
import axios from 'axios';
//import pdfMake from "pdfmake/build/pdfmake";
//import pdfFonts from "pdfmake/build/vfs_fonts";
import dateService from "@/globalServices/dateService";
import apiService from "@/globalServices/apiService";

class ExportService {
  constructor() {
    this.logoChimpaBase64 = "data:image/png;base64,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";
    //pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  /**
   * @param rootsChildrenGraphs
   * @param data Array
   */
  async exportToPdf(rootsChildrenGraphs, data) {
    let promises = [];
    let pointerToExport;
    let numberOfDevices = data.get('numberOfDevices');
    let optionsFromDialog = data.get('optionsFromDialog');
    let listEvents = data.get('listEvents');
    pointerToExport = am5plugins_exporting.Exporting.new(rootsChildrenGraphs.find(el => el.chartType === 'PieEventsPerOs').root, {});
    //promises.push(pointerToExport.getPdfmake());
    promises.push(pointerToExport.export("png"));
    pointerToExport = am5plugins_exporting.Exporting.new(rootsChildrenGraphs.find(el => el.chartType === 'LinearNetworkActivities').root, {});
    promises.push(pointerToExport.export("png"));
    pointerToExport = am5plugins_exporting.Exporting.new(rootsChildrenGraphs.find(el => el.chartType === 'PieAppUsages').root, {});
    promises.push(pointerToExport.export("png"));
    pointerToExport = am5plugins_exporting.Exporting.new(rootsChildrenGraphs.find(el => el.chartType === 'barEventsPerOs').root, {});
    promises.push(pointerToExport.export("png"));
    pointerToExport = am5plugins_exporting.Exporting.new(rootsChildrenGraphs.find(el => el.chartType === 'LinearEventsPerNotificationType').root, {});
    promises.push(pointerToExport.export("png"));
    if (optionsFromDialog.modExportTableEvents === 'CSV') {
      promises.push(this._downloadCsvFromServer(optionsFromDialog));
    }
    await Promise.all(promises).then(
      async res => {
        // pdfmake and chart snapshots are ready
        // res[0] contains pdfmake instance
        // res[1] contains shapshot of chart 1
        // etc.
        let doc = this._initializePdfContent(optionsFromDialog);
        //OS FRAGMENTATION CHART
        doc.content.push([
          {
            text: translateService.getTranslation(optionsFromDialog.languageChosen, 'OS_FRAGMENTATION'),
            style: {
              fontSize: 24,
              bold: true,
            },
            alignment: 'center',
            pageBreak: 'before'
          },
          {
            image: res[0],
            width: 850,
            height: 500,
            alignment: 'center',
            relativePosition: {y: 5}
          }]
        );
        /*    KEEP COMMENT, TO REFACTOR AFTER NETWORK_ACTIVITY AND APP_USAGE DB REFACTOR
        doc.content.push([
                  {
                    text: translateService.getTranslation(optionsFromDialog.languageChosen,'DATA_USAGE'),
                    style: {
                      fontSize: 24,
                      bold: true,
                    },
                    alignment: 'center',
                    pageBreak: 'before'
                  },
                  {
                    image: res[1],
                    width: 800,
                    height: 500,
                    relativePosition: {y: 5}
                  },
                  {
                    image: this.logoChimpaBase64,
                    fit: [80, 80],
                    absolutePosition: {x: 750, y: 550}
                  }]
                );
                doc.content.push([
                  {
                    text: translateService.getTranslation(optionsFromDialog.languageChosen,'DATA_USAGE_BY_APPLICATION'),
                    style: {
                      fontSize: 24,
                      bold: true,
                    },
                    alignment: 'center',
                    pageBreak: 'before'
                  },
                  {
                    image: res[2],
                    width: 750,
                    height: 500,
                    alignment: 'center',
                    relativePosition: {y: 5}
                  },
                  {
                    image: this.logoChimpaBase64,
                    fit: [80, 80],
                    absolutePosition: {x: 750, y: 550}
                  }]
                );*/
        //TECHNICAL REPORT
        doc.content.push([
          {
            text: translateService.getTranslation(optionsFromDialog.languageChosen, 'TECHNICAL_REPORT'),
            style: {
              fontSize: 24,
              bold: true,
            },
            alignment: 'center',
            pageBreak: 'before'
          },
          {
            columns: [
              {width: '*', text: ''},
              {
                width: 'auto',
                table: {
                  widths: [200, 300],
                  body: [
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'CREATION_DATE'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: new Date().toLocaleString(),
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'START_PERIOD'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: optionsFromDialog.period.from,
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'END_PERIOD'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: optionsFromDialog.period.to,
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'NUMBER_OF_DAYS_IN_PERIOD'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true
                        }
                      },
                      {
                        text: optionsFromDialog.period.numberOfDaysSelected,
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'NUMBER_OF_EVENTS'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: optionsFromDialog.numberTotalEvents,
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                    /*[
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen,'NUMBER_OF_REMEDIATIONS'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: 'waiting for api',
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],*/
                    [
                      {
                        text: translateService.getTranslation(optionsFromDialog.languageChosen, 'CRITICAL_EVENTS'),
                        alignment: 'right',
                        fillColor: '#dddddd',
                        style: {
                          fontSize: 18,
                          bold: true,
                        }
                      },
                      {
                        text: optionsFromDialog.numberTotalCriticalEvents,
                        alignment: 'right',
                        style: {
                          fontSize: 16,
                        }
                      }
                    ],
                  ],
                  alignment: 'center',
                },
              },
              {width: '*', text: ''},
            ],
            relativePosition: {x: 0, y: 150},
          }]
        );
        //EVENTS BY OS CHART
        doc.content.push([
          {
            text: translateService.getTranslation(optionsFromDialog.languageChosen, 'OS_FRAGMENTATION'),
            style: {
              fontSize: 24,
              bold: true,
            },
            pageBreak: 'before',
            alignment: 'center'
          },
          {
            image: res[3],
            width: 850,
            height: 500,
            relativePosition: {x: 0, y: 30},
          }]
        );
        //EVENTS BY TYPE CHART
        doc.content.push([
          {
            text: translateService.getTranslation(optionsFromDialog.languageChosen, 'EVENTS_BY_TYPE'),
            style: {
              fontSize: 24,
              bold: true,
            },
            pageBreak: 'before',
            alignment: 'center'
          },
          {
            image: res[4],
            width: 850,
            height: 500,
            relativePosition: {x: 0, y: 30},
          }]
        );
        if (optionsFromDialog.modExportTableEvents === 'PDF') {
          doc.content.push([
            {
              text: translateService.getTranslation(optionsFromDialog.languageChosen, 'DETECTED_EVENTS_DETAILS'),
              style: {
                fontSize: 24,
                bold: true,
              },
              pageBreak: 'before',
              alignment: 'center'
            },
            {
              table: {
                headerRows: 1,
                widths: [150, 120, 50, 100, 50, 40, 250],
                body: [
                  [{
                    text: 'Event Type',
                    bold: true
                  }, {
                    text: 'Device Serial Number',
                    bold: true
                  }, {
                    text: 'Os Type',
                    bold: true
                  }, {
                    text: 'Detection Date',
                    bold: true
                  }, {
                    text: 'Resolved',
                    bold: true
                  }, {
                    text: 'Score',
                    bold: true
                  }, {
                    text: 'Description',
                    bold: true
                  }
                  ],
                  ...this._getDataToPopulateTable(listEvents.items, optionsFromDialog)
                ],
                alignment: 'center',
              }
            }
          ]);
        }
        pdfMake.createPdf(doc).download(optionsFromDialog.fileName + '.pdf');

      })
      .catch(err => {
        console.log(err)
      })
    ;
  }

  async exportSyslogEventToPdf(options) {
    let doc = this._initializePdfContent(options);
    // LIST EVENTS
    doc.content.push([
      {
        text: translateService.getTranslation(options.languageChosen, 'DETECTED_EVENTS_DETAILS'),
        style: {
          fontSize: 24,
          bold: true,
        },
        pageBreak: 'before',
        alignment: 'center'
      },
      {
        table: {
          headerRows: 0,
          widths: ['*'],
          body: options.events.map((el, index) => [{
            text: el,
            fillColor: index % 2 === 0 ? '#F2F2F2' : undefined
          }]),
          alignment: 'center',
        }
      }]
    );
    pdfMake.createPdf(doc).download((options.fileName ?? 'file') + '.pdf');
  }

  async exportMispEventsToPdf(options) {
    let doc = this._initializePdfContent(options);
    // LIST EVENTS
    doc.content.push([
      {
        text: translateService.getTranslation(options.languageChosen, 'DETECTED_EVENTS_DETAILS'),
        style: {
          fontSize: 24,
          bold: true,
        },
        pageBreak: 'before',
        alignment: 'center'
      },
      {
        table: {
          headerRows: 0,
          widths: ['*'],
          body: options.events.map((el, index) => [{
            text: el,
            fillColor: index % 2 === 0 ? '#F2F2F2' : undefined
          }]),
          alignment: 'center',
        }
      }
    ]);
    pdfMake.createPdf(doc).download((options.fileName ?? 'file') + '.pdf');
  }

  _getDataToPopulateTable(items, options) {
    let listToPrint = [];
    for (const item of items) {
      listToPrint.push([
        item.key ? translateService.getTranslation(options.languageChosen, item.key) : '',
        item.deviceSerialNumber ?? '',
        item.deviceOsType ?? '',
        item.detectionDate ?? '',
        !!item.hasBeenSolved ? 'Yes' : 'No',
        item.score ?? '',
        item.description ? translateService.getTranslation(options.languageChosen, item.description) : ''
      ])
    }
    return listToPrint;
  }


  /**
   *
   * @param items: {
   *           osVersionFilter: this.osVersionFilter,
   *           osTypeFilter: this.osTypeFilter,
   *           criticalityFilter: this.criticalityFilter,
   *           selectedDaysFilter: this.selectedDaysFilter,
   *           eventTypesFilter: this.eventTypesFilter,
   *           serialNumbersFilter: this.serialNumbersFilter,
   *         }
   * @private
   */
  _generateRowsFiltersActivated(options) {
    let filters = options.filters;
    let rows = [
      [
        {
          text: translateService.getTranslation(options.languageChosen, 'ACTIVE_FILTERS'),
          alignment: 'center',
          fillColor: '#f1ee8e',
          style: {
            fontSize: 18,
            bold: true,
          }
        },
      ],
    ]
    if (!!filters.osTypeFilter) {
      rows.push(
        [
          {
            text: translateService.getTranslation(options.languageChosen, 'OS') + ' ' + filters.osTypeFilter.toUpperCase(),
            alignment: 'left',
            style: {
              fontSize: 16,
            }
          }
        ]);
      if (!!filters.osVersionFilter) {
        rows.push(
          [
            {
              text: 'Version ' + ' ' + filters.osVersionFilter,
              alignment: 'left',
              style: {
                fontSize: 16,
              }
            }
          ]);
      }
    }
    if (!!filters.criticalityFilter) {
      rows.push(
        [
          {
            text: translateService.getTranslation(options.languageChosen, 'SELECTED_GRAVITY')  +
              filters.criticalityFilter.map(el => el !== 'critic' ?
                translateService.getTranslation(options.languageChosen, el.toUpperCase()) :
                translateService.getTranslation(options.languageChosen, 'CRITICAL')).join(', '),
            alignment: 'left',
            style: {
              fontSize: 16,
            }
          }
        ]);
    }
    if (!!filters.selectedDaysFilter) {
      rows.push(
        [
          {
            text: translateService.getTranslation(options.languageChosen, 'SELECTED_DAYS') + filters.selectedDaysFilter.join(', '),
            alignment: 'left',
            style: {
              fontSize: 16,
            }
          }
        ]);
    }
    if (!!filters.eventTypesFilter) {
      rows.push(
        [
          {
            text: translateService.getTranslation(options.languageChosen, !!filters.eventTypesFilter.include ? 'INCLUDED_EVENT_TYPES' : 'EXCLUDED_EVENT_TYPES')
              + ' ' + options.eventTypesSelectedText.join(', '),
            alignment: 'left',
            style: {
              fontSize: 16,
            }
          }
        ]);
    }
    if (!!filters.serialNumbersFilter) {
      rows.push(
        [
          {
            text: translateService.getTranslation(options.languageChosen, !!filters.serialNumbersFilter.include ? 'INCLUDED_SERIALS' : 'EXCLUDED_SERIALS')
              + ' ' + filters.serialNumbersFilter.items.join(", "),
            alignment: 'left',
            style: {
              fontSize: 16,
            }
          }
        ]);
    }
    return rows;
  }

  _downloadCsvFromServer(payloadFromDialog) {
    return new Promise((resolve, reject) => {
      let filters = payloadFromDialog.filters;
      apiService.axiosToBackend()
        .get("/api/event/export", {
          params: {
            filters: {
              deviceOsVersion: filters.osVersionFilter,
              deviceOsType: filters.osTypeFilter,
              serialNumbers: filters.serialNumbersFilter,
              eventTypes: filters.eventTypesFilter,
              selectedDays: filters.selectedDaysFilter,
              criticality: filters.criticalityFilter,
              period: payloadFromDialog.period,
              clientIds: payloadFromDialog.clientsSelected.map((el) => el.id),
              withDevice: true,
              modExport: 'CSV'
            },
          },
          responseType: 'blob'
        })
        .then(response => {
          const blob = new Blob([response.data])
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = payloadFromDialog.fileName + '.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve('success');
        })
        .catch(err => reject(err))
    })
  }

  _fetchEvents(payloadFromServer) {
    return new Promise((resolve, reject) => {
      apiService.axiosToBackend()
        .get("/api/event/export", {
          params: {
            filters: {...payloadFromServer.filters}
          }
        })
        .then(response => resolve(response))
        .catch(err => reject(err))
    })
  }

  _checkAtLeastOneFilterSet(filters) {
    let atLeastOneFilterSet = false;
    for (const [key, value] of Object.entries(filters)) {
      if ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && !!value)) {
        atLeastOneFilterSet = true
        break;
      }
    }
    return atLeastOneFilterSet;
  }

  _initializePdfContent(options) {
    let doc = {
      pageSize: "A4",
      pageMargins: [10, 10, 10, 30],
      content: [],
      pageOrientation: "landscape",
      watermark: !!options.watermark ? {
        text: options.watermark,
        color: 'grey',
        opacity: 0.2,
        bold: true
      } : undefined,
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            {width: '*', text: ''},
            {
              width: 'auto',
              text: currentPage.toString() + ' of ' + pageCount,
              align: 'center',
              bold: true
            },
            {
              width: '*',
              image: this.logoChimpaBase64,
              fit: [80, 40],
              alignment: 'right'
            }
          ],
        }
      },
    };
    doc.content.push([
      {
        text: translateService.getTranslation(options.languageChosen, 'GENERAL_REPORT'),
        style: {
          fontSize: 24,
          bold: true,
        },
        alignment: 'center'
      },
      {
        columns: [
          {width: '*', text: ''},
          {
            width: 'auto',
            table: {
              widths: [200, 300],
              body: [
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'CREATION_DATE'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true,
                    }
                  },
                  {
                    text: new Date().toLocaleString(),
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'SELECTED_CUSTOMERS'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true,
                    }
                  },
                  {
                    text: options.clientsSelected.map(el => el.companyName).join(", "),
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'START_PERIOD'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true,
                    }
                  },
                  {
                    text: dateService.getDateSetWithCurrentTimezone(options.period.from,options.languageChosen),
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'END_PERIOD'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true,
                    }
                  },
                  {
                    text: dateService.getDateSetWithCurrentTimezone(options.period.to,options.languageChosen),
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'TIMEZONE'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true,
                    }
                  },
                  {
                    text: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
                [
                  {
                    text: translateService.getTranslation(options.languageChosen, 'NOTES_FROM_PANEL'),
                    alignment: 'right',
                    fillColor: '#dddddd',
                    style: {
                      fontSize: 18,
                      bold: true
                    }
                  },
                  {
                    text: !!options.notes ? options.notes : '',
                    alignment: 'right',
                    style: {
                      fontSize: 16,
                    }
                  }
                ],
              ],
              alignment: 'center',
            },
          },
          {width: '*', text: ''},
        ],
        relativePosition: {x: 0, y: 50},
      },
    ]);
    if (this._checkAtLeastOneFilterSet(options.filters)) {
      doc.content.push(
        {
          columns: [
            {width: '*', text: ''},
            {
              width: 'auto',
              table: {
                widths: [510],
                body: this._generateRowsFiltersActivated(options),
                alignment: 'center',
              },
            },
            {width: '*', text: ''},
          ],
          relativePosition: {x: 0, y: 320},
        }
      );
    }
    return doc;
  }
}

export default new ExportService()
