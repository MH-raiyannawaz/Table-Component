import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MenuItem } from "../../DataTable/types"
import { DropdownMenuSubContent, Label } from "@radix-ui/react-dropdown-menu"
import { useMemo } from "react"

export default function SelectFilter({ menuItem }: { menuItem: MenuItem }) {

  const activeLabel = useMemo(() => {
    const activeItem = menuItem.subItems?.find(item => item.isActive)
    return activeItem ? String(activeItem.label) : ''
  }, [menuItem.subItems])


  return <DropdownMenuSubContent avoidCollisions>
    <div className="bg-white w-44 flex flex-col items-center p-2 ml-2.5 rounded shadow-xl">
      <Label className='py-2'>Select</Label>
      <Select value={activeLabel} onValueChange={(e) => {
        menuItem.onChange?.({ id: menuItem.id, label: e, isActive: true })
      }}>
        <SelectTrigger className="w-full max-w-48">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select</SelectLabel>
            {menuItem.subItems?.map(subItem => (
              <SelectItem key={subItem.id} value={subItem.label || ''}>{subItem.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </DropdownMenuSubContent>
}

