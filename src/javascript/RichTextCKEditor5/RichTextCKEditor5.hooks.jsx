import {isProductivityMode} from './RichTextCKEditor5.utils';
import {useEffect, useState} from 'react';

export const useTranslation = lang => {
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(lang);
        if (lang) {
            import(`ckeditor5/translations/${lang}.js`)
                .then(module => {
                    const trans = [module.default];

                    if (isProductivityMode()) {
                        import(`ckeditor5-premium-features/translations/${lang}.js`)
                            .then(module => {
                                trans.push(module.default);
                            })
                            .catch(() => {
                                console.info(`Did not find premium translations for CK5 in language: ${lang}. Will used default translations.`);
                            }).finally(() => {
                                setTranslations(trans);
                                setLoading(false);
                            });
                    } else {
                        setTranslations(trans);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    console.info(`Did not find translations for CK5 in language: ${lang}. Will use default translations.`);
                    setTranslations([]);
                    setLoading(false);
                });
        }
    }, [lang]);

    return {loading, translations};
};
