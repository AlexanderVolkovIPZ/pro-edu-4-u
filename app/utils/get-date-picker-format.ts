export const getDatePickerDateFormat = (locale: string) => {
  switch (locale) {
    case 'en-US':
    case 'en-GB':
    case 'en-AU':
      return 'MM/dd/YYYY';

    case 'uk-UA':
    case 'fr-FR':
    case 'de-DE':
      return 'dd.MM.YYYY';

    case 'es-ES':
    case 'it-IT':
    case 'pl-PL':
      return 'dd/MM/YYYY';

    case 'zh-CN':
    case 'ja-JP':
      return 'YYYY/MM/dd';

    default:
      return 'dd.MM.YYYY';
  }
};

export const getDatePickerTimeFormat = (locale: string) => {
  switch (locale) {
    case 'uk-UA':
    case 'fr-FR':
    case 'de-DE':
    case 'es-ES':
    case 'it-IT':
    case 'pl-PL':
    case 'zh-CN':
    case 'ja-JP':
      return 'HH:mm';

    case 'en-US':
    case 'en-GB':
    case 'en-AU':
    default:
      return 'hh:mm';
  }
};
