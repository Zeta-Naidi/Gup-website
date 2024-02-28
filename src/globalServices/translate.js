import languages from './langs.json'
class Translate {
     getTranslation(language,key) {
        return !!language ? languages[language][key] : key;
    }
} export default new Translate()
