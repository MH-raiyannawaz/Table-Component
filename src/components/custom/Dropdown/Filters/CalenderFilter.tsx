"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import type { MenuItem } from "../../DataTable/types"

export default function CalendarCustomDays({menuItem}: {menuItem: MenuItem}) {
  const today = new Date()
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: menuItem.range?.from || addDays(today, -2),
    to: menuItem.range?.to || addDays(today, 2),
  })

  return (
    <DropdownMenuSubContent className="translate-x-10 sticky">
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={(e)=>{
          setRange(e)
          menuItem.onSelect(e)
        }}
        numberOfMonths={1}
        captionLayout="dropdown"
        formatters={{
          formatMonthDropdown: (date) => {
            return date.toLocaleString("default", { month: "long" })
          },
        }}
        components={{
          DayButton: ({ children, modifiers, day, ...props }) => {
            // const isWeekend =
            //   day.date.getDay() === 0 || day.date.getDay() === 6

            return (
              <CalendarDayButton
                className={`${modifiers.range_start || modifiers.range_end ? 'bg-blue-500 text-white' : ''}
                ${modifiers.range_middle ? 'bg-blue-100 text-blue-900' : ''}`}
                day={day} modifiers={modifiers} {...props}>
                {children}
                {/* {!modifiers.outside && (
                  <span>{isWeekend ? "$120" : "$100"}</span>
                )} */}
              </CalendarDayButton>
            )
          },
        }}
      />
    </DropdownMenuSubContent>
  )
}