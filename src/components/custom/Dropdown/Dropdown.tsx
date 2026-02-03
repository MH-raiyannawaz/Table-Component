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
import MultipleSelectFilter from "./Filters/MultipleSelectFilter"
import DragAndDropComponent from "../DragAndDrop/DragAndDropComponent"
import SelectFilter from "./Filters/SelectFilter"
import type { DragEndEvent } from "@dnd-kit/core"
import type { FilterData } from "../DataTable/types"

export default function Dropdown({ children, label, draggable, menuItems, filterData, handleDragEnd }:
  { children: ReactNode, label: string, draggable?: Boolean,  menuItems?: MenuItem[], filterData?: FilterData[], handleDragEnd?: (event: DragEndEvent) => void }) {
    return (
    <DropdownMenu>
      {/* Button */}
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      {/* Button */}

      <DropdownMenuContent className="relative left-16">
          { filterData?.length && draggable && handleDragEnd ?
          <DropdownMenuGroup>
            <DragAndDropComponent label={label} filterData={filterData} handleDragEnd={handleDragEnd}/>
          </DropdownMenuGroup>
          : <DropdownMenuGroup className="max-h-74 min-w-52">
            {/* Dropdown Header  */}
            <DropdownMenuLabel className="p-2 font-semibold">{label}</DropdownMenuLabel>
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
                  <DropdownMenuItem onClick={menuItem.onClick}>
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
