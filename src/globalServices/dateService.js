class DateService {

  constructor() {
  }

  /**
   * @param {String} date - date to convert, e.g. 2022-10-12 00:30:21
   * @param {String} language - language to convert the date to
   * @returns {String} - date converted
   */
  getDateSetWithCurrentTimezone(date, language) {
    let dateToConvert = new Date(date)
    let _date = new Date(
      Date.UTC(
        dateToConvert.getFullYear(),
        dateToConvert.getMonth(),
        dateToConvert.getDate(),
        dateToConvert.getHours(),
        dateToConvert.getMinutes(),
        dateToConvert.getSeconds()
      )
    );
    return _date.toLocaleString(this.getIsoCountryCode(language), {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }
    )
  }

  /**
   * @param {string} language - example 'it' or 'en'
   * @returns {string}
   */
  getIsoCountryCode(language) {
    if (language === 'it') return 'IT'
    else if (language === 'en') return 'EN'
    else if (language === 'de') return 'DE'
    else if (language === 'es') return 'ES'
  }

  /**
   * @param {string} language - example 'it' or 'en'
   * @returns {string}
   */
  getBCP74Tag(language) {
    if (language === 'it') return 'it-IT'
    else if (language === 'en') return 'en-GB'
    else if (language === 'de') return 'de-DE'
    else if (language === 'es') return 'es-ES'
  }

  /**
   *
   * @returns {{numberOfDaysSelected: number, from: String, to: String}}
   */
  setPeriodComponentToLastWeek() {
    let from = new Date();
    let to = new Date();
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0);
    to.setHours(23, 59, 59, 59);
    return {
      from: (() => {
        const date = from.toISOString().split('T')[0];
        const time = from.toISOString().split('T')[1].substring(0, 8);
        return `${date} ${time}`
      })(),
      to: (() => {
        const date = to.toISOString().split('T')[0];
        const time = to.toISOString().split('T')[1].substring(0, 8);
        return `${date} ${time}`
      })(),
      numberOfDaysSelected: 7,
      fromUtcString: from.toISOString(),
      toUtcString: to.toISOString(),
    };
  }
}

export default new DateService()