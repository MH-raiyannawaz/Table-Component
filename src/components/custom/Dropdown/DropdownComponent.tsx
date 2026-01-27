import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type ReactNode } from "react"
import type { MenuItem } from '../Table/types'
import RangeFilter from "./Filters/RangeFilter"
import CalenderFilter from "./Filters/CalenderFilter"
import SelectFilter from "./Filters/SelectFilter"

export default function DropdownComponent({ children, label, menuItems }: { children: ReactNode, label: string, menuItems: MenuItem[] }) {
  return (
      <DropdownMenu>
        {/* Button */}
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        {/* Button */}

        <DropdownMenuContent className="relative left-16">
          <DropdownMenuGroup className="max-h-74 min-w-52">
            {/* Dropdown Header  */}
            <DropdownMenuLabel className="p-2 font-semibold">{label}</DropdownMenuLabel>
            {/* Dropdown Header  */}
            {
              menuItems.map(menuItem => {
                let { icon: Icon } = menuItem

                return menuItem.type === 'filter' ?

                  // Filter 
                  <DropdownMenuSub key={menuItem.id}>
                    <DropdownMenuSubTrigger>{menuItem.label}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      {/* Range  */}
                      {menuItem.filterType === 'range' ?
                        <RangeFilter menuItem={menuItem} />
                        // Range 
                        // Calendar 
                        : menuItem.filterType === 'date' ? <CalenderFilter />
                          // Calendar 
                          // Select 
                          : <SelectFilter menuItems={menuItems} menuItem={menuItem} />
                        // Select 
                      }
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  // Filter 
                  :
                  // Actions
                  <DropdownMenuItem onClick={menuItem.onClick}>
                    {menuItem.label}
                    <DropdownMenuShortcut>{Icon && <Icon />}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                // Actions
              })
            }

          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
