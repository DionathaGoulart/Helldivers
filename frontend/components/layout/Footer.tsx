'use client';

import { useTranslation } from '@/lib/translations';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t-2 border-[#3a4a5a] w-full mt-auto bg-[#1a2332]">
      <div className="container page-content">
        <div className="text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
          <p className="mt-2 text-sm text-gray-500">
            {t('footer.serving')}
          </p>
        </div>
      </div>
    </footer>
  );
}
