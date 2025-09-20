import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const SUPPORTED_LANGUAGES = ['en', 'si', 'ta'];
const DEFAULT_LANGUAGE = 'en';

const I18nContext = createContext(null);

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  }
  return DEFAULT_LANGUAGE;
};

const interpolate = (template, variables = {}) => {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(/{{\s*(.+?)\s*}}/g, (_, key) => {
    const value = variables[key];
    return value === undefined || value === null ? '' : String(value);
  });
};

const resolveKeyPath = (resource, key) => {
  if (!resource || typeof resource !== 'object') {
    return undefined;
  }

  return key.split('.').reduce((accumulator, segment) => {
    if (accumulator === undefined || accumulator === null) {
      return undefined;
    }
    const next = accumulator[segment];
    return next === undefined ? undefined : next;
  }, resource);
};

const loadLocaleFile = async (language) => {
  const basePath = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
  const response = await fetch(`${basePath}/locales/${language}/common.json`);

  if (!response.ok) {
    throw new Error(`Unable to load translations for '${language}'.`);
  }

  return response.json();
};

export const languageOptions = [
  { code: 'en', labelKey: 'app.language.english' },
  { code: 'si', labelKey: 'app.language.sinhala' },
  { code: 'ta', labelKey: 'app.language.tamil' },
];

export function I18nextProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [resources, setResources] = useState({});
  const loadingLanguagesRef = useRef(new Set());

  const ensureLanguage = useCallback(async (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return;
    }

    if (loadingLanguagesRef.current.has(lang)) {
      return;
    }

    if (resources[lang]) {
      return;
    }

    loadingLanguagesRef.current.add(lang);
    try {
      const data = await loadLocaleFile(lang);
      setResources((previous) => {
        if (previous[lang]) {
          return previous;
        }
        return { ...previous, [lang]: data };
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      loadingLanguagesRef.current.delete(lang);
    }
  }, [resources]);

  useEffect(() => {
    ensureLanguage(DEFAULT_LANGUAGE);
  }, [ensureLanguage]);

  useEffect(() => {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      setLanguage(DEFAULT_LANGUAGE);
      return;
    }
    ensureLanguage(language);
  }, [language, ensureLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const changeLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      return;
    }
    setLanguage(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', nextLanguage);
    }
  }, []);

  const translate = useCallback((key, options = {}) => {
    if (!key) {
      return '';
    }

    const languagesToTry = [language];
    if (!languagesToTry.includes(DEFAULT_LANGUAGE)) {
      languagesToTry.push(DEFAULT_LANGUAGE);
    }

    for (const currentLanguage of languagesToTry) {
      const resource = resources[currentLanguage];
      const value = resolveKeyPath(resource, key);
      if (typeof value === 'string') {
        return interpolate(value, options);
      }
    }

    if (options.defaultValue) {
      return interpolate(options.defaultValue, options);
    }

    return key;
  }, [language, resources]);

  const contextValue = useMemo(() => ({
    language,
    changeLanguage,
    t: translate,
  }), [language, changeLanguage, translate]);

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nextProvider');
  }

  return {
    t: context.t,
    i18n: {
      language: context.language,
      changeLanguage: context.changeLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
    },
  };
}

export const i18n = {
  get language() {
    return getInitialLanguage();
  },
  changeLanguage: () => {},
};

