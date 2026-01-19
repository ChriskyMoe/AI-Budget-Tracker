'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BudgetForm } from './BudgetForm'

interface Category {
  id: string
  name: string
}

interface AddBudgetButtonProps {
  categories: Category[]
  baseCurrency: string
  currentMonth: number
  currentYear: number
}

export function AddBudgetButton({
  categories,
  baseCurrency,
  currentMonth,
  currentYear,
}: AddBudgetButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Budget
      </Button>
      <BudgetForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
        baseCurrency={baseCurrency}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </>
  )
}
