import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Fragment, type ReactNode } from "react"
import IndeterminateCheckbox from "../IndeterminateCheckbox/IndeterminateCheckbox"
import RangeFilter from "./Filters/RangeFilter"
import CalenderFilter from "./Filters/CalenderFilter"
import MultipleSelectFilter from "./Filters/MultipleSelectFilter"
import ProrityOrder from "../DraggableMenu/DraggableMenu"
import SelectFilter from "./Filters/SelectFilter"
import type { DragEndEvent } from "@dnd-kit/core"
import type { Data, FilterData, MenuItem } from "../DataTable/types"

/** Portal content for one column filter (same as single `type === 'filter'` row). */
function FilterColumnPortal({ menuItem, allMenuItems }: { menuItem: MenuItem; allMenuItems: MenuItem[] }) {
  return (
    <>
      {menuItem.filterType === "boolean" ? (
        <SelectFilter menuItem={menuItem} />
      ) : menuItem.filterType === "number" ? (
        <RangeFilter menuItem={menuItem} />
      ) : menuItem.filterType === "date" ? (
        <CalenderFilter menuItem={menuItem} />
      ) : (
        <MultipleSelectFilter menuItem={menuItem} menuItems={allMenuItems} />
      )}
    </>
  )
}

export default function Dropdown({ children, label, draggable, menuItems, filterData, handleDragEnd, data, filterItems, insideActionsMenu }:
  { children: ReactNode, label: string, draggable?: Boolean,  menuItems?: MenuItem[], filterData?: FilterData[], 
    handleDragEnd?: (event: DragEndEvent) => void, data?: Data, filterItems?: MenuItem[], insideActionsMenu?: boolean }) {
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
                // Built-in filter priority: draggable list inside Actions (or other) menu
                if (menuItem.id === 'priority-data' && filterData && handleDragEnd) {
                  return (
                    <DropdownMenuSub key={menuItem.id}>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        {menuItem.label}
                        {Icon && <Icon className="h-4 w-4" />}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="min-w-52 p-2" alignOffset={-4}>
                          <ProrityOrder filterData={filterData} handleDragEnd={handleDragEnd} />
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )
                }
                // Actions menu: all column filters under one "Filter" submenu tab
                if (menuItem.id === "filter-data" && insideActionsMenu && filterItems?.length) {
                  return (
                    <DropdownMenuSub key={menuItem.id}>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        {menuItem.label}
                        {Icon && <Icon className="h-4 w-4" />}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="min-w-52 p-0" alignOffset={-4}>
                          {filterItems.map((fi) => (
                            <DropdownMenuSub key={fi.id}>
                              <DropdownMenuSubTrigger>{fi.label}</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <FilterColumnPortal menuItem={fi} allMenuItems={filterItems} />
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )
                }
                // Standalone Columns button: flat list (not nested under a second tab)
                if (menuItem.id === 'view-data' && menuItem.subItems?.length && !insideActionsMenu) {
                  return (
                    <Fragment key={menuItem.id}>
                      {menuItem.subItems.map((subItem) => (
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
                              onCheck: subItem.onCheck,
                            }}
                          />
                        </DropdownMenuItem>
                      ))}
                    </Fragment>
                  )
                }
                return menuItem.type === 'filter' ?
                // Filter 
                <DropdownMenuSub key={menuItem.id}>
                    <DropdownMenuSubTrigger>{menuItem.label}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <FilterColumnPortal menuItem={menuItem} allMenuItems={menuItems ?? []} />
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
