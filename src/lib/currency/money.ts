import type { CurrencyCode } from '@/types/trips'

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function convertToBaseCurrency(
  originalAmount: number,
  exchangeRate: number,
): number {
  return roundCurrency(originalAmount * exchangeRate)
}

export function formatMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}
