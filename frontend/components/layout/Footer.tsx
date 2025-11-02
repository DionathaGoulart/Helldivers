'use client';

import { useTranslation } from '@/lib/translations';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t-2 border-[#3a4a5a] w-full mt-auto bg-[#1a2332]">
      <div className="container page-content py-6">
        <div className="text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
          <p className="mt-2 text-sm text-gray-500">
            {t('footer.serving')}
          </p>
          <p className="mt-4 text-sm text-gray-400">
            {t('footer.contactBefore')}
            <a 
              href="mailto:contato@dionatha.com.br"
              className="text-[var(--holo-cyan)] hover:text-[var(--terminal-green)] transition-colors underline hover:no-underline"
            >
              contato@dionatha.com.br
            </a>
            {t('footer.contactAfter')}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {t('footer.github')}
            <a 
              href="https://github.com/DionathaGoulart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--holo-cyan)] hover:text-[var(--terminal-green)] transition-colors underline hover:no-underline"
            >
              {t('footer.githubLink')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
