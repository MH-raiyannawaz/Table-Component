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
import { DropdownMenuSubContent } from "@radix-ui/react-dropdown-menu"
import { Label } from "@/components/ui/label"

export default function SelectFilter({ menuItem }: { menuItem: MenuItem }) {
  // Find the active subItem based on the checked flag
  const currentActive = menuItem.subItems?.find(item => item.checked)

  return (
    <DropdownMenuSubContent avoidCollisions>
      <div className="bg-white w-44 flex flex-col items-center p-2 ml-2.5 rounded shadow-xl">
        <Label className='py-2'>Select</Label>
        <Select 
          value={currentActive?.id} // Use the ID, not checked
          onValueChange={(selectedId) => {
            const selectedSubItem = menuItem.subItems?.find(
              item => item.id === selectedId
            )
            if (selectedSubItem?.id && selectedSubItem?.label && menuItem.onChange) {
              // Call onChange with just the id parameter
              menuItem.onChange(selectedSubItem.id)
            }
          }}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select</SelectLabel>
              {menuItem.subItems?.map(subItem => (
                <SelectItem 
                  key={subItem.id} 
                  value={subItem.id}
                >
                  {subItem.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </DropdownMenuSubContent>
  )
}