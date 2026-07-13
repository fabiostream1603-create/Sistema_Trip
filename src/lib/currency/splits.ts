import { roundCurrency } from '@/lib/currency/money'

export function buildEqualSplits(
  travelerIds: string[],
  totalAmount: number,
): Array<{ amount: number; traveler_id: string }> {
  if (travelerIds.length === 0) {
    return []
  }

  const baseShare = roundCurrency(totalAmount / travelerIds.length)
  let remaining = roundCurrency(totalAmount)

  return travelerIds.map((travelerId, index) => {
    const amount =
      index === travelerIds.length - 1 ? remaining : Math.min(baseShare, remaining)
    remaining = roundCurrency(remaining - amount)
    return {
      traveler_id: travelerId,
      amount,
    }
  })
}

export function sumSplitAmounts(values: Array<{ amount: number }>) {
  return roundCurrency(values.reduce((total, value) => total + value.amount, 0))
}
