import { localeStorageKey } from '@/i18n/config';

export async function changeLocale(nextLocale: string, currentLocale: string): Promise<void> {
  if (nextLocale === currentLocale) return;

  localStorage.setItem(localeStorageKey, nextLocale);

  await fetch('/api/v1/locale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: nextLocale }),
  });

  window.location.reload();
}
