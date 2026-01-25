import { DropdownMenuItem, DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { MenuItem, MenuSubItem } from '../../Table/types'
import { useEffect, useRef, useState } from 'react'

export default function SelectFilter({menuItems, menuItem}: {menuItems: MenuItem[], menuItem: MenuItem}) {

    type IndeterminateCheckboxProps = {
        checked?: boolean
        indeterminate?: boolean
        onChange?: (checked: boolean) => void
        className?: string
    }

    const [newSubItems, setNewSubItems] = useState<MenuSubItem[]>([])

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

    const handleFilterChange = (value: string, id: string) => {
        let currentSubItems = menuItems.find(menuItem => menuItem.id === id)?.subItems ?? []
        let filteredSubItems = currentSubItems?.filter(currentSubItem => currentSubItem.label?.toString().toLowerCase().includes(value.toLowerCase()))
        setNewSubItems(value === '' ? currentSubItems : filteredSubItems)
    }

    return (
        <DropdownMenuSubContent className="max-h-74 overflow-y-scroll relative p-0">
            <Field className="p-2 sticky top-0 bg-white z-100 shadow">
                <Input
                    id="input-field-username"
                    type="text"
                    placeholder={`Search ${menuItem.label}`}
                    className="m-0"
                    onChange={(e) => handleFilterChange(String(e.target.value), menuItem.id)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </Field>
            {newSubItems.length > 0 ? newSubItems.map(subItem => (
                <DropdownMenuItem
                    key={subItem.id}
                    onSelect={(e) => e.preventDefault()}
                    className="flex justify-between items-center gap-2"
                >
                    <span>{subItem.label}</span>
                    <IndeterminateCheckbox
                        {...{
                            size: 40,
                            checked: subItem.checked,
                            onChange: subItem.toggleVisibility
                        }}
                    />
                </DropdownMenuItem>
            )) : menuItem.subItems?.map(subItem => (
                <DropdownMenuItem
                    key={subItem.id}
                    onSelect={(e) => e.preventDefault()}
                    className="flex justify-between items-center gap-2"
                >
                    <span>{subItem.label}</span>
                    <IndeterminateCheckbox
                        {...{
                            size: 40,
                            checked: subItem.checked,
                            onChange: subItem.toggleVisibility
                        }}
                    />
                </DropdownMenuItem>
            ))}
        </DropdownMenuSubContent>
    )
}
