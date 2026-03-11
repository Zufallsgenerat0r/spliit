import { getGroupExpenses } from '@/lib/api'

export function getTotalGroupSpending(
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  return expenses.reduce(
    (total, expense) =>
      expense.isReimbursement ? total : total + expense.amount,
    0,
  )
}

export function getTotalActiveUserPaidFor(
  activeUserId: string | null,
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  return expenses.reduce((total, expense) => {
    if (expense.isReimbursement) return total

    const paidByList = (expense as any).paidByList
    if (paidByList && paidByList.length > 0) {
      return total + calculatePaidByShare(activeUserId, expense as any)
    }

    // Legacy fallback: single payer
    return expense.paidBy.id === activeUserId ? total + expense.amount : total
  }, 0)
}

export function calculatePaidByShare(
  participantId: string | null,
  expense: {
    amount: number
    paidByList: { participant: { id: string }; shares: number }[]
    paidBySplitMode: string
  },
): number {
  const paidByList = expense.paidByList
  const userPaidBy = paidByList.find((p) => p.participant.id === participantId)

  if (!userPaidBy) return 0

  const totalShares = paidByList.reduce((sum, p) => sum + p.shares, 0)

  switch (expense.paidBySplitMode) {
    case 'EVENLY':
      return expense.amount / paidByList.length
    case 'BY_AMOUNT':
      return userPaidBy.shares
    case 'BY_PERCENTAGE':
      return (expense.amount * userPaidBy.shares) / totalShares
    case 'BY_SHARES':
      return (expense.amount * userPaidBy.shares) / totalShares
    default:
      return 0
  }
}

type Expense = NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>[number]

export function calculateShare(
  participantId: string | null,
  expense: Pick<
    Expense,
    'amount' | 'paidFor' | 'splitMode' | 'isReimbursement'
  >,
): number {
  if (expense.isReimbursement) return 0

  const paidFors = expense.paidFor
  const userPaidFor = paidFors.find(
    (paidFor) => paidFor.participant.id === participantId,
  )

  if (!userPaidFor) return 0

  const shares = Number(userPaidFor.shares)

  switch (expense.splitMode) {
    case 'EVENLY':
      // Divide the total expense evenly among all participants
      return expense.amount / paidFors.length
    case 'BY_AMOUNT':
      // Directly add the user's share if the split mode is BY_AMOUNT
      return shares
    case 'BY_PERCENTAGE':
      // Calculate the user's share based on their percentage of the total expense
      return (expense.amount * shares) / 10000 // Assuming shares are out of 10000 for percentage
    case 'BY_SHARES':
      // Calculate the user's share based on their shares relative to the total shares
      const totalShares = paidFors.reduce(
        (sum, paidFor) => sum + Number(paidFor.shares),
        0,
      )
      return (expense.amount * shares) / totalShares
    default:
      return 0
  }
}

export function getTotalActiveUserShare(
  activeUserId: string | null,
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  const total = expenses.reduce(
    (sum, expense) => sum + calculateShare(activeUserId, expense),
    0,
  )

  return parseFloat(total.toFixed(2))
}
