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
  shortcut?: string
  onClick?: () => void,
  subItems?: MenuSubItem[]
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
      <DropdownMenuContent className="w-40 mr-7.5" align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.map((item, index) => (
            <div key={index}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setExpandedIndex(
                    expandedIndex === index ? null : index
                  )
                }}
                onClick={item.onClick}
                className="flex justify-between">
                {item.label}
                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
              {item.subItems &&
                <>
                  {expandedIndex === index && (
                    <div className="ml-3 mt-1 space-y-1">
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
          ))}
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
