import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from 'react'

type MenuSubItem = {
  id: string
  label: string
  checked: boolean
  toggleVisibility: (value?: boolean) => void
}

type MenuItem = {
  label: string
  onClick?: () => void,
  subItems?: MenuSubItem[],
  onlySM?: boolean
  icon?: LucideIcon
}

export default function DropdownMenuDemo({ children, items }: { children: ReactNode, items: MenuItem[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  type IndeterminateCheckboxProps = {
    checked?: boolean
    indeterminate?: boolean
    onChange?: (checked: boolean) => void
    className?: string
  }

  function IndeterminateCheckbox({
    indeterminate,
    checked,
    onChange,
    className = '',
  }: IndeterminateCheckboxProps) {
    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
      if (ref.current) {
        ref.current.indeterminate = Boolean(indeterminate && !checked)
      }
    }, [indeterminate, checked])


    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        className={className + ' cursor-pointer'}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 mr-7.5 scroll-hide max-h-84" align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.map((item, index) => {
            let { icon:Icon } = item
            return <div key={index}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setExpandedIndex(
                    expandedIndex === index ? null : index
                  )
                }}
                onClick={item.onClick}
                className={`flex justify-between ${item.onlySM ? 'lg:hidden' : 'lg:flex'}`}>
                {item.label}
                <DropdownMenuShortcut>{Icon && <Icon/>}</DropdownMenuShortcut>
              </DropdownMenuItem>
              {item.subItems &&
                <>
                  {expandedIndex === index && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const key = subItem.id

                        return (
                          <DropdownMenuItem
                            key={key}
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center gap-2"
                          >
                            <IndeterminateCheckbox
                              {...{
                                size: 40,
                                checked: subItem.checked,
                                onChange: subItem.toggleVisibility
                              }}
                            />
                            <span>{subItem.label || subItem.id}</span>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  )}
                </>
              }
            </div>
})}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
