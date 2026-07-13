import { convertToBaseCurrency, roundCurrency } from '@/lib/currency/money'

describe('money utils', () => {
  it('rounds to two decimals', () => {
    expect(roundCurrency(10.005)).toBe(10.01)
  })

  it('converts using exchange rate', () => {
    expect(convertToBaseCurrency(320, 0.1845)).toBe(59.04)
  })
})
