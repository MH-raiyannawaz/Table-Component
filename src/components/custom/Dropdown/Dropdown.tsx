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
import RangeFilter from "./Filters/RangeFilter"
import CalenderFilter from "./Filters/CalenderFilter"
import MultipleSelectFilter from "./Filters/MultipleSelectFilter"
import ProrityOrder from "../DraggableMenu/DraggableMenu"
import SelectFilter from "./Filters/SelectFilter"
import type { DragEndEvent } from "@dnd-kit/core"
import type { Data, FilterData, MenuItem } from "../DataTable/types"

export default function Dropdown({ children, label, draggable, menuItems, filterData, handleDragEnd, data }:
  { children: ReactNode, label: string, draggable?: Boolean,  menuItems?: MenuItem[], filterData?: FilterData[], 
    handleDragEnd?: (event: DragEndEvent) => void, data?: Data }) {
    return (
    <DropdownMenu>
      {/* Button */}
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      {/* Button */}

      <DropdownMenuContent className="relative left-16">
        <DropdownMenuLabel className="p-2 font-semibold">{label}</DropdownMenuLabel>
          { draggable && handleDragEnd ?
          <DropdownMenuGroup>
            <ProrityOrder filterData={filterData || []} handleDragEnd={handleDragEnd}/>
          </DropdownMenuGroup>
          : <DropdownMenuGroup className="max-h-74 min-w-52">
            {/* Dropdown Header  */}
            {/* Dropdown Header  */}
            {
              menuItems?.map(menuItem => {
                let { icon: Icon } = menuItem
                return menuItem.type === 'filter' ?
                // Filter 
                <DropdownMenuSub key={menuItem.id}>
                    <DropdownMenuSubTrigger>{menuItem.label}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      {menuItem.filterType === 'boolean' ?
                        //Multiple
                        <SelectFilter menuItem={menuItem}/> :
                        //Multiple
                        //Range
                        menuItem.filterType === 'number' ?
                        <RangeFilter menuItem={menuItem} />
                        // Range 
                        // Calendar 
                        : menuItem.filterType === 'date' ? <CalenderFilter menuItem={menuItem} />
                          // Calendar 
                          // Multiple Select 
                          : <MultipleSelectFilter menuItem={menuItem} menuItems={menuItems}/>
                        // Multiple Select 
                      }
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  // Filter 
                  :
                  // Actions
                  <DropdownMenuItem onClick={data ? ()=>{ menuItem.onClick(data)} : menuItem.onClick}>
                    {menuItem.label}
                    <DropdownMenuShortcut>{Icon && <Icon />}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                // Actions
              })
            }
          </DropdownMenuGroup>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
