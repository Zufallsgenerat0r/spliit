import { expenseFormSchema } from './schemas'

function byAmountExpense(amount: string, shares: string[]) {
  return {
    expenseDate: new Date('2026-09-01'),
    title: 'Dinner',
    amount,
    paidBy: 'a',
    splitMode: 'BY_AMOUNT',
    saveDefaultSplittingOptions: false,
    isReimbursement: false,
    paidFor: shares.map((shares, i) => ({ participant: `p${i}`, shares })),
  }
}

function issueMessages(input: unknown): string[] {
  const result = expenseFormSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('expenseFormSchema, split by amount', () => {
  it('accepts amounts that add up to the expense amount', () => {
    expect(
      issueMessages(
        byAmountExpense('524.34', [
          '110.11',
          '209.74',
          '104.87',
          '89.14',
          '10.48',
        ]),
      ),
    ).toEqual([])
  })

  it('rejects amounts one cent off', () => {
    expect(
      issueMessages(
        byAmountExpense('524.34', [
          '110.11',
          '209.74',
          '104.87',
          '89.14',
          '10.49',
        ]),
      ),
    ).toEqual(['amountSum'])
  })

  it('sums amounts typed with a decimal comma', () => {
    expect(
      issueMessages(byAmountExpense('100', ['50', '30', '20,00'])),
    ).toEqual([])
  })

  it('reports an emptied amount instead of throwing on it', () => {
    expect(issueMessages(byAmountExpense('100', ['60', '']))).toEqual([
      'noZeroShares',
      'amountSum',
    ])
  })
})

describe('expenseFormSchema, multiple payers', () => {
  function multiPayerExpense(
    amount: string,
    paidBySplitMode: string,
    shares: string[],
  ) {
    return {
      ...byAmountExpense(amount, [amount]),
      isMultiPayer: true,
      paidBySplitMode,
      paidByList: shares.map((shares, i) => ({ participant: `p${i}`, shares })),
    }
  }

  it('scales reopened percentages like paidFor', () => {
    const result = expenseFormSchema.safeParse(
      multiPayerExpense('100', 'BY_PERCENTAGE', ['50', '50']),
    )
    expect(result.success).toBe(true)
    expect(result.data?.paidByList.map(({ shares }) => shares)).toEqual([
      5000, 5000,
    ])
  })

  it('rejects percentages that do not add up to 100', () => {
    expect(
      issueMessages(multiPayerExpense('100', 'BY_PERCENTAGE', ['50', '40'])),
    ).toEqual(['paidByPercentageSum'])
  })

  it('accepts a single-payer income without paidByList rows', () => {
    expect(
      issueMessages({
        ...byAmountExpense('-20', ['1']),
        splitMode: 'EVENLY',
        paidByList: [],
      }),
    ).toEqual([])
  })
})
