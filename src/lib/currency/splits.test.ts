import { buildEqualSplits, sumSplitAmounts } from '@/lib/currency/splits'

describe('expense split utils', () => {
  it('builds equal splits and preserves total', () => {
    const splits = buildEqualSplits(['a', 'b', 'c'], 100)
    expect(sumSplitAmounts(splits)).toBe(100)
    expect(splits).toHaveLength(3)
  })
})
