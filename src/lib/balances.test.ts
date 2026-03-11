import {
  getBalances,
  getPublicBalances,
  getSuggestedReimbursements,
} from './balances'
import { alice, bob, charlie, dave, makeExpense } from './test-helpers'

describe('getBalances', () => {
  it('should return empty object for empty expenses', () => {
    expect(getBalances([])).toEqual({})
  })

  it('should handle single payer baseline (via paidByList with one entry)', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
        ],
        splitMode: 'EVENLY',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(3000)
    expect(balances[alice.id].paidFor).toBe(1500)
    expect(balances[alice.id].total).toBe(1500)
    expect(balances[bob.id].paid).toBe(0)
    expect(balances[bob.id].paidFor).toBe(1500)
    expect(balances[bob.id].total).toBe(-1500)
  })

  it('should handle legacy expense without paidByList (fallback path)', () => {
    const expense = {
      id: 'legacy-1',
      amount: 2000,
      paidBy: alice,
      paidFor: [
        { participant: alice, shares: 1 },
        { participant: bob, shares: 1 },
      ],
      splitMode: 'EVENLY',
      paidByList: [], // empty list triggers legacy fallback
      paidBySplitMode: 'BY_AMOUNT',
      isReimbursement: false,
      title: 'Legacy',
      expenseDate: new Date(),
      createdAt: new Date(),
      category: null,
      recurrenceRule: 'NONE',
      _count: { documents: 0 },
    } as any

    const balances = getBalances([expense])
    expect(balances[alice.id].paid).toBe(2000)
    expect(balances[alice.id].paidFor).toBe(1000)
    expect(balances[bob.id].paid).toBe(0)
    expect(balances[bob.id].paidFor).toBe(1000)
  })

  it('should handle explicit single-entry paidByList', () => {
    const expenses = [
      makeExpense({
        amount: 5000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 2500 },
          { participant: bob, shares: 2500 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [{ participant: alice, shares: 5000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(5000)
    expect(balances[alice.id].paidFor).toBe(2500)
    expect(balances[alice.id].total).toBe(2500)
  })

  it('should handle multi-payer BY_AMOUNT: Alice pays $20, Bob pays $10', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1500 },
          { participant: bob, shares: 1500 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2000 },
          { participant: bob, shares: 1000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(2000)
    expect(balances[alice.id].paidFor).toBe(1500)
    expect(balances[alice.id].total).toBe(500)
    expect(balances[bob.id].paid).toBe(1000)
    expect(balances[bob.id].paidFor).toBe(1500)
    expect(balances[bob.id].total).toBe(-500)
  })

  it('should handle multi-payer EVENLY: 2 payers split $30 equally', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
          { participant: charlie, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
        ],
        paidBySplitMode: 'EVENLY',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(1500)
    expect(balances[alice.id].paidFor).toBe(1000)
    expect(balances[alice.id].total).toBe(500)
    expect(balances[bob.id].paid).toBe(1500)
    expect(balances[bob.id].paidFor).toBe(1000)
    expect(balances[bob.id].total).toBe(500)
    expect(balances[charlie.id].paid).toBe(0)
    expect(balances[charlie.id].paidFor).toBe(1000)
    expect(balances[charlie.id].total).toBe(-1000)
  })

  it('should handle multi-payer BY_PERCENTAGE: 70%/30% split', () => {
    const expenses = [
      makeExpense({
        amount: 10000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 5000 },
          { participant: bob, shares: 5000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 7000 },
          { participant: bob, shares: 3000 },
        ],
        paidBySplitMode: 'BY_PERCENTAGE',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(7000)
    expect(balances[alice.id].total).toBe(2000)
    expect(balances[bob.id].paid).toBe(3000)
    expect(balances[bob.id].total).toBe(-2000)
  })

  it('should handle multi-payer BY_SHARES: 2:1 ratio', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
          { participant: charlie, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 200 },
          { participant: bob, shares: 100 },
        ],
        paidBySplitMode: 'BY_SHARES',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(2000)
    expect(balances[alice.id].total).toBe(1000)
    expect(balances[bob.id].paid).toBe(1000)
    expect(balances[bob.id].total).toBe(0)
  })

  it('should handle paidFor splitMode EVENLY with multi-payer', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
          { participant: charlie, shares: 1 },
        ],
        splitMode: 'EVENLY',
        paidByList: [
          { participant: alice, shares: 2000 },
          { participant: bob, shares: 1000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paidFor).toBe(1000)
    expect(balances[bob.id].paidFor).toBe(1000)
    expect(balances[charlie.id].paidFor).toBe(1000)
    expect(balances[alice.id].paid).toBe(2000)
    expect(balances[bob.id].paid).toBe(1000)
  })

  it('should handle paidFor splitMode BY_SHARES with multi-payer', () => {
    const expenses = [
      makeExpense({
        amount: 6000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 200 },
          { participant: bob, shares: 100 },
        ],
        splitMode: 'BY_SHARES',
        paidByList: [
          { participant: alice, shares: 3000 },
          { participant: bob, shares: 3000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    // BY_SHARES: alice 2/3 = 4000, bob 1/3 = 2000
    expect(balances[alice.id].paidFor).toBe(4000)
    expect(balances[bob.id].paidFor).toBe(2000)
    expect(balances[alice.id].paid).toBe(3000)
    expect(balances[bob.id].paid).toBe(3000)
  })

  it('should handle paidFor splitMode BY_PERCENTAGE with multi-payer', () => {
    const expenses = [
      makeExpense({
        amount: 10000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 6000 }, // 60%
          { participant: bob, shares: 4000 }, // 40%
        ],
        splitMode: 'BY_PERCENTAGE',
        paidByList: [
          { participant: alice, shares: 5000 },
          { participant: bob, shares: 5000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paidFor).toBe(6000)
    expect(balances[bob.id].paidFor).toBe(4000)
  })

  it('should handle payer in paidByList but NOT in paidFor', () => {
    const expenses = [
      makeExpense({
        amount: 2000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 2000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [{ participant: alice, shares: 2000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(2000)
    expect(balances[alice.id].paidFor).toBe(0)
    expect(balances[alice.id].total).toBe(2000)
    expect(balances[bob.id].paid).toBe(0)
    expect(balances[bob.id].paidFor).toBe(2000)
    expect(balances[bob.id].total).toBe(-2000)
  })

  it('should handle participant in paidFor but NOT in paidByList', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
          { participant: charlie, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [{ participant: alice, shares: 3000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[charlie.id].paid).toBe(0)
    expect(balances[charlie.id].paidFor).toBe(1000)
    expect(balances[charlie.id].total).toBe(-1000)
  })

  it('should handle rounding with even multi-payer split', () => {
    const expenses = [
      makeExpense({
        amount: 1200,
        paidBy: alice,
        paidFor: [{ participant: charlie, shares: 1200 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
        ],
        paidBySplitMode: 'EVENLY',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(600)
    expect(balances[bob.id].paid).toBe(600)
    expect(balances[alice.id].paid + balances[bob.id].paid).toBe(1200)
  })

  it('should handle odd amount 3-way split with remaining going to last payer', () => {
    const expenses = [
      makeExpense({
        amount: 1001,
        paidBy: alice,
        paidFor: [{ participant: charlie, shares: 1001 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
          { participant: charlie, shares: 1 },
        ],
        paidBySplitMode: 'EVENLY',
      }),
    ]

    const balances = getBalances(expenses)
    const totalPaid =
      balances[alice.id].paid +
      balances[bob.id].paid +
      balances[charlie.id].paid
    expect(Math.abs(totalPaid - 1001)).toBeLessThanOrEqual(1)
  })

  it('should always have net zero sum of all balances', () => {
    const expenses = [
      makeExpense({
        amount: 9999,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 3333 },
          { participant: bob, shares: 3333 },
          { participant: charlie, shares: 3333 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 5000 },
          { participant: bob, shares: 4999 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    const totalBalance = Object.values(balances).reduce(
      (sum, b) => sum + b.total,
      0,
    )
    expect(totalBalance).toBe(0)
  })

  it('should avoid negative zeros in balances', () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 1000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    // paid and paidFor should be 1000, total should be 0 (not -0)
    expect(Object.is(balances[alice.id].total, -0)).toBe(false)
    expect(balances[alice.id].total).toBe(0)
  })

  it('should handle multiple expenses with multi-payer', () => {
    const expenses = [
      makeExpense({
        amount: 2000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 1200 },
          { participant: bob, shares: 800 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
      makeExpense({
        amount: 1000,
        paidBy: bob,
        paidFor: [
          { participant: alice, shares: 500 },
          { participant: bob, shares: 500 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [{ participant: bob, shares: 1000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    expect(balances[alice.id].paid).toBe(1200)
    expect(balances[alice.id].paidFor).toBe(1500)
    expect(balances[alice.id].total).toBe(-300)
    expect(balances[bob.id].paid).toBe(1800)
    expect(balances[bob.id].paidFor).toBe(1500)
    expect(balances[bob.id].total).toBe(300)
  })
})

describe('getPublicBalances', () => {
  it('should return empty object for empty reimbursements', () => {
    expect(getPublicBalances([])).toEqual({})
  })

  it('should compute balances from a single reimbursement', () => {
    const balances = getPublicBalances([
      { from: alice.id, to: bob.id, amount: 500 },
    ])
    expect(balances[alice.id].paidFor).toBe(500)
    expect(balances[alice.id].total).toBe(-500)
    expect(balances[bob.id].paid).toBe(500)
    expect(balances[bob.id].total).toBe(500)
  })

  it('should accumulate across multiple reimbursements', () => {
    const balances = getPublicBalances([
      { from: alice.id, to: bob.id, amount: 300 },
      { from: charlie.id, to: bob.id, amount: 700 },
    ])
    expect(balances[bob.id].paid).toBe(1000)
    expect(balances[bob.id].total).toBe(1000)
    expect(balances[alice.id].total).toBe(-300)
    expect(balances[charlie.id].total).toBe(-700)
  })

  it('should handle same participant as both sender and receiver across reimbursements', () => {
    const balances = getPublicBalances([
      { from: alice.id, to: bob.id, amount: 500 },
      { from: bob.id, to: alice.id, amount: 200 },
    ])
    expect(balances[alice.id].paidFor).toBe(500)
    expect(balances[alice.id].paid).toBe(200)
    expect(balances[alice.id].total).toBe(-300)
    expect(balances[bob.id].paidFor).toBe(200)
    expect(balances[bob.id].paid).toBe(500)
    expect(balances[bob.id].total).toBe(300)
  })
})

describe('getSuggestedReimbursements', () => {
  it('should return empty for all-zero balances', () => {
    const balances = getBalances([
      makeExpense({
        amount: 1000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 1000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ])
    expect(getSuggestedReimbursements(balances)).toEqual([])
  })

  it('should return empty for empty balances', () => {
    expect(getSuggestedReimbursements({})).toEqual([])
  })

  it('should produce correct reimbursements for multi-payer expenses', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
          { participant: charlie, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2000 },
          { participant: bob, shares: 1000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    const reimbursements = getSuggestedReimbursements(balances)

    // Alice: +1000, Bob: 0, Charlie: -1000
    expect(reimbursements).toHaveLength(1)
    expect(reimbursements[0]).toEqual({
      from: charlie.id,
      to: alice.id,
      amount: 1000,
    })
  })

  it('should handle multiple debtors and multiple creditors', () => {
    const expenses = [
      makeExpense({
        amount: 4000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
          { participant: charlie, shares: 1000 },
          { participant: dave, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2500 },
          { participant: bob, shares: 1500 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]

    const balances = getBalances(expenses)
    // Alice: paid 2500, owes 1000 → +1500
    // Bob: paid 1500, owes 1000 → +500
    // Charlie: paid 0, owes 1000 → -1000
    // Dave: paid 0, owes 1000 → -1000
    const reimbursements = getSuggestedReimbursements(balances)

    // Total reimbursed should equal total owed
    const totalReimbursed = reimbursements.reduce((s, r) => s + r.amount, 0)
    expect(totalReimbursed).toBe(2000)
    expect(reimbursements.length).toBeGreaterThanOrEqual(2)
  })

  it('should filter out near-zero reimbursements from rounding', () => {
    // Manually construct balances with tiny residuals
    const balances = {
      [alice.id]: { paid: 1000, paidFor: 1000, total: 0.0001 },
      [bob.id]: { paid: 1000, paidFor: 1000, total: -0.0001 },
    }
    const reimbursements = getSuggestedReimbursements(balances)
    expect(reimbursements).toEqual([])
  })
})
