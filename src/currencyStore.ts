const STORAGE_KEY = 'gift-tracker:currency'

export const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'USD' },
  { code: 'EUR', symbol: '€',  label: 'EUR' },
  { code: 'GBP', symbol: '£',  label: 'GBP' },
  { code: 'JPY', symbol: '¥',  label: 'JPY' },
  { code: 'CAD', symbol: 'C$', label: 'CAD' },
  { code: 'AUD', symbol: 'A$', label: 'AUD' },
  { code: 'PHP', symbol: '₱',  label: 'PHP' },
  { code: 'SGD', symbol: 'S$', label: 'SGD' },
  { code: 'KRW', symbol: '₩',  label: 'KRW' },
  { code: 'INR', symbol: '₹',  label: 'INR' },
  { code: 'MXN', symbol: '$',  label: 'MXN' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export function loadCurrency(): CurrencyCode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return (CURRENCIES.find((c) => c.code === stored)?.code ?? 'USD') as CurrencyCode
}

export function saveCurrency(code: CurrencyCode): void {
  localStorage.setItem(STORAGE_KEY, code)
}

export function formatPrice(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'JPY' || code === 'KRW' ? 0 : 2,
  }).format(amount)
}
