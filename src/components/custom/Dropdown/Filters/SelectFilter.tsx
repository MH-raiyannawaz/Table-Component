import { DropdownMenuItem, DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { MenuItem, MenuSubItem } from '../../Table/types'
import { useState } from 'react'
import IndeterminateCheckbox from '../../Table/mincomponents/IndeterminateCheckbox'

export default function SelectFilter({ menuItems, menuItem }: { menuItems: MenuItem[], menuItem: MenuItem }) {

    const [newSubItems, setNewSubItems] = useState<MenuSubItem[]>([])

    const handleFilterChange = (label: string, id: string) => {
        let currentSubItems = menuItems.find(menuItem => menuItem.id === id)?.subItems ?? []
        let filteredSubItems = currentSubItems?.filter(currentSubItem => currentSubItem.label?.toString().toLowerCase().includes(label.toLowerCase()))
        setNewSubItems(label === '' ? currentSubItems : filteredSubItems)
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
                            onChange: subItem.onChange,
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
                            onChange: subItem.onChange
                        }}
                    />
                </DropdownMenuItem>
            ))}
        </DropdownMenuSubContent>
    )
}
