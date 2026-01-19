'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionForm } from './TransactionForm'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface AddTransactionButtonProps {
  categories: Category[]
  baseCurrency: string
}

export function AddTransactionButton({ categories, baseCurrency }: AddTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Transaction
      </Button>
      <TransactionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
        baseCurrency={baseCurrency}
      />
    </>
  )
}
