import { format } from 'date-fns'

export function formatDateRange(startDate: string, endDate: string) {
  return `${format(new Date(startDate), 'dd MMM yyyy')} - ${format(
    new Date(endDate),
    'dd MMM yyyy',
  )}`
}

export function formatCurrencyValue(
  value: number | null,
  currency: 'EUR' | 'BRL',
) {
  if (value === null) {
    return `${currency} 0.00`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}
