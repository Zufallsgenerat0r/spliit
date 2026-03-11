type SplitMode = 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'

export type TestParticipant = { id: string; name: string }

export const alice: TestParticipant = { id: 'alice', name: 'Alice' }
export const bob: TestParticipant = { id: 'bob', name: 'Bob' }
export const charlie: TestParticipant = { id: 'charlie', name: 'Charlie' }
export const dave: TestParticipant = { id: 'dave', name: 'Dave' }

let expenseCounter = 0

export function makeExpense({
  amount,
  paidBy,
  paidFor,
  splitMode = 'EVENLY' as const,
  isReimbursement = false,
  paidByList,
  paidBySplitMode = 'BY_AMOUNT' as const,
}: {
  amount: number
  paidBy: TestParticipant
  paidFor: { participant: TestParticipant; shares: number }[]
  splitMode?: SplitMode
  isReimbursement?: boolean
  paidByList?: { participant: TestParticipant; shares: number }[]
  paidBySplitMode?: SplitMode
}) {
  return {
    id: `exp-${++expenseCounter}`,
    amount,
    paidBy,
    paidFor,
    splitMode,
    isReimbursement,
    paidByList: paidByList ?? [{ participant: paidBy, shares: amount }],
    paidBySplitMode: paidByList ? paidBySplitMode : 'BY_AMOUNT',
    title: 'Test',
    expenseDate: new Date(),
    createdAt: new Date(),
    category: null,
    recurrenceRule: 'NONE',
    _count: { documents: 0 },
  } as any
}
