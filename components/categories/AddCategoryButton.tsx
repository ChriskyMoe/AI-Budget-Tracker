'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryForm } from './CategoryForm'

export function AddCategoryButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>
      <CategoryForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
