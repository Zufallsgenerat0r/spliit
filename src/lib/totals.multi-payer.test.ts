import { alice, bob, charlie, makeExpense } from './test-helpers'
import {
  calculatePaidByShare,
  calculateShare,
  getTotalActiveUserPaidFor,
  getTotalActiveUserShare,
  getTotalGroupSpending,
} from './totals'

// ─── getTotalGroupSpending ───────────────────────────────────────────

describe('getTotalGroupSpending', () => {
  it('returns 0 for empty expenses', () => {
    expect(getTotalGroupSpending([])).toBe(0)
  })

  it('sums expense amounts (ignoring multi-payer details)', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2000 },
          { participant: bob, shares: 1000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalGroupSpending(expenses)).toBe(3000)
  })

  it('excludes reimbursements', () => {
    const expenses = [
      makeExpense({
        amount: 5000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 5000 }],
        splitMode: 'BY_AMOUNT',
      }),
      makeExpense({
        amount: 2000,
        paidBy: bob,
        paidFor: [{ participant: alice, shares: 2000 }],
        splitMode: 'BY_AMOUNT',
        isReimbursement: true,
      }),
    ]
    expect(getTotalGroupSpending(expenses)).toBe(5000)
  })

  it('returns 0 when all expenses are reimbursements', () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 1000 }],
        splitMode: 'BY_AMOUNT',
        isReimbursement: true,
      }),
    ]
    expect(getTotalGroupSpending(expenses)).toBe(0)
  })

  it('sums multiple non-reimbursement expenses', () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 1000 }],
        splitMode: 'BY_AMOUNT',
      }),
      makeExpense({
        amount: 2000,
        paidBy: bob,
        paidFor: [{ participant: alice, shares: 2000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalGroupSpending(expenses)).toBe(3000)
  })
})

// ─── getTotalActiveUserPaidFor ───────────────────────────────────────

describe('getTotalActiveUserPaidFor', () => {
  it('returns 0 for empty expenses', () => {
    expect(getTotalActiveUserPaidFor(alice.id, [])).toBe(0)
  })

  it('returns 0 for null activeUserId', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserPaidFor(null, expenses)).toBe(0)
  })

  it('calculates partial paid amount for multi-payer BY_AMOUNT', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2000 },
          { participant: bob, shares: 1000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(2000)
    expect(getTotalActiveUserPaidFor(bob.id, expenses)).toBe(1000)
  })

  it('calculates partial paid amount for multi-payer EVENLY', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
        ],
        paidBySplitMode: 'EVENLY',
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(1500)
    expect(getTotalActiveUserPaidFor(bob.id, expenses)).toBe(1500)
  })

  it('calculates partial paid amount for multi-payer BY_PERCENTAGE', () => {
    const expenses = [
      makeExpense({
        amount: 10000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 10000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 7000 }, // 70%
          { participant: bob, shares: 3000 }, // 30%
        ],
        paidBySplitMode: 'BY_PERCENTAGE',
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(7000)
    expect(getTotalActiveUserPaidFor(bob.id, expenses)).toBe(3000)
  })

  it('calculates partial paid amount for multi-payer BY_SHARES', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        paidByList: [
          { participant: alice, shares: 2 }, // 2/3
          { participant: bob, shares: 1 }, // 1/3
        ],
        paidBySplitMode: 'BY_SHARES',
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(2000)
    expect(getTotalActiveUserPaidFor(bob.id, expenses)).toBe(1000)
  })

  it('excludes reimbursements', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        isReimbursement: true,
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(0)
  })

  it('falls back to legacy single-payer when paidByList is empty', () => {
    const expense = makeExpense({
      amount: 5000,
      paidBy: alice,
      paidFor: [{ participant: bob, shares: 5000 }],
      splitMode: 'BY_AMOUNT',
    })
    // Override paidByList to be empty to test legacy path
    ;(expense as any).paidByList = []

    expect(getTotalActiveUserPaidFor(alice.id, [expense])).toBe(5000)
    expect(getTotalActiveUserPaidFor(bob.id, [expense])).toBe(0)
  })

  it('accumulates across multiple expenses', () => {
    const expenses = [
      makeExpense({
        amount: 2000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 2000 }],
        splitMode: 'BY_AMOUNT',
      }),
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserPaidFor(alice.id, expenses)).toBe(5000)
  })

  it('returns 0 when user is not a payer in any expense', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserPaidFor(charlie.id, expenses)).toBe(0)
  })
})

// ─── calculatePaidByShare ────────────────────────────────────────────

describe('calculatePaidByShare', () => {
  it('returns 0 when participant is not in paidByList', () => {
    expect(
      calculatePaidByShare(charlie.id, {
        amount: 3000,
        paidByList: [{ participant: alice, shares: 3000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ).toBe(0)
  })

  it('returns 0 for null participantId', () => {
    expect(
      calculatePaidByShare(null, {
        amount: 3000,
        paidByList: [{ participant: alice, shares: 3000 }],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ).toBe(0)
  })

  it('BY_AMOUNT: returns shares directly', () => {
    expect(
      calculatePaidByShare(alice.id, {
        amount: 5000,
        paidByList: [
          { participant: alice, shares: 3000 },
          { participant: bob, shares: 2000 },
        ],
        paidBySplitMode: 'BY_AMOUNT',
      }),
    ).toBe(3000)
  })

  it('EVENLY: divides amount equally among payers', () => {
    expect(
      calculatePaidByShare(alice.id, {
        amount: 3000,
        paidByList: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
          { participant: charlie, shares: 1 },
        ],
        paidBySplitMode: 'EVENLY',
      }),
    ).toBe(1000)
  })

  it('BY_PERCENTAGE: calculates proportional amount', () => {
    expect(
      calculatePaidByShare(alice.id, {
        amount: 10000,
        paidByList: [
          { participant: alice, shares: 6000 }, // 60%
          { participant: bob, shares: 4000 }, // 40%
        ],
        paidBySplitMode: 'BY_PERCENTAGE',
      }),
    ).toBe(6000)
  })

  it('BY_SHARES: calculates proportional amount by shares', () => {
    expect(
      calculatePaidByShare(alice.id, {
        amount: 6000,
        paidByList: [
          { participant: alice, shares: 2 },
          { participant: bob, shares: 1 },
        ],
        paidBySplitMode: 'BY_SHARES',
      }),
    ).toBe(4000)
  })

  it('returns 0 for unknown split mode', () => {
    expect(
      calculatePaidByShare(alice.id, {
        amount: 3000,
        paidByList: [{ participant: alice, shares: 3000 }],
        paidBySplitMode: 'UNKNOWN' as any,
      }),
    ).toBe(0)
  })
})

// ─── calculateShare ──────────────────────────────────────────────────

describe('calculateShare', () => {
  it('returns 0 when participant is not in paidFor', () => {
    const expense = makeExpense({
      amount: 3000,
      paidBy: alice,
      paidFor: [{ participant: alice, shares: 3000 }],
      splitMode: 'BY_AMOUNT',
    })
    expect(calculateShare(charlie.id, expense)).toBe(0)
  })

  it('returns 0 for null participantId', () => {
    const expense = makeExpense({
      amount: 3000,
      paidBy: alice,
      paidFor: [{ participant: alice, shares: 3000 }],
      splitMode: 'BY_AMOUNT',
    })
    expect(calculateShare(null, expense)).toBe(0)
  })

  it('returns 0 for reimbursements', () => {
    const expense = makeExpense({
      amount: 3000,
      paidBy: alice,
      paidFor: [{ participant: bob, shares: 3000 }],
      splitMode: 'BY_AMOUNT',
      isReimbursement: true,
    })
    expect(calculateShare(bob.id, expense)).toBe(0)
  })

  it('BY_AMOUNT: returns shares directly', () => {
    const expense = makeExpense({
      amount: 3000,
      paidBy: alice,
      paidFor: [
        { participant: alice, shares: 1500 },
        { participant: bob, shares: 1500 },
      ],
      splitMode: 'BY_AMOUNT',
    })
    expect(calculateShare(alice.id, expense)).toBe(1500)
    expect(calculateShare(bob.id, expense)).toBe(1500)
  })

  it('EVENLY: divides amount equally among participants', () => {
    const expense = makeExpense({
      amount: 3000,
      paidBy: alice,
      paidFor: [
        { participant: alice, shares: 1 },
        { participant: bob, shares: 1 },
        { participant: charlie, shares: 1 },
      ],
      splitMode: 'EVENLY',
    })
    expect(calculateShare(alice.id, expense)).toBe(1000)
    expect(calculateShare(bob.id, expense)).toBe(1000)
  })

  it('BY_PERCENTAGE: calculates proportional amount', () => {
    const expense = makeExpense({
      amount: 10000,
      paidBy: alice,
      paidFor: [
        { participant: alice, shares: 6000 }, // 60% (shares stored as basis points)
        { participant: bob, shares: 4000 }, // 40%
      ],
      splitMode: 'BY_PERCENTAGE',
    })
    expect(calculateShare(alice.id, expense)).toBe(6000)
    expect(calculateShare(bob.id, expense)).toBe(4000)
  })

  it('BY_SHARES: calculates proportional amount by shares', () => {
    const expense = makeExpense({
      amount: 6000,
      paidBy: alice,
      paidFor: [
        { participant: alice, shares: 2 },
        { participant: bob, shares: 1 },
      ],
      splitMode: 'BY_SHARES',
    })
    expect(calculateShare(alice.id, expense)).toBe(4000)
    expect(calculateShare(bob.id, expense)).toBe(2000)
  })
})

// ─── getTotalActiveUserShare ─────────────────────────────────────────

describe('getTotalActiveUserShare', () => {
  it('returns 0 for empty expenses', () => {
    expect(getTotalActiveUserShare(alice.id, [])).toBe(0)
  })

  it('returns 0 for null activeUserId', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: alice, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserShare(null, expenses)).toBe(0)
  })

  it('sums shares across multiple expenses', () => {
    const expenses = [
      makeExpense({
        amount: 2000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1000 },
          { participant: bob, shares: 1000 },
        ],
        splitMode: 'BY_AMOUNT',
      }),
      makeExpense({
        amount: 3000,
        paidBy: bob,
        paidFor: [
          { participant: alice, shares: 1500 },
          { participant: bob, shares: 1500 },
        ],
        splitMode: 'BY_AMOUNT',
      }),
    ]
    expect(getTotalActiveUserShare(alice.id, expenses)).toBe(2500)
  })

  it('excludes reimbursements', () => {
    const expenses = [
      makeExpense({
        amount: 3000,
        paidBy: alice,
        paidFor: [{ participant: bob, shares: 3000 }],
        splitMode: 'BY_AMOUNT',
        isReimbursement: true,
      }),
    ]
    expect(getTotalActiveUserShare(bob.id, expenses)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: alice,
        paidFor: [
          { participant: alice, shares: 1 },
          { participant: bob, shares: 1 },
          { participant: charlie, shares: 1 },
        ],
        splitMode: 'EVENLY',
      }),
    ]
    // 1000/3 = 333.333... → rounded to 333.33
    expect(getTotalActiveUserShare(alice.id, expenses)).toBe(333.33)
  })
})
