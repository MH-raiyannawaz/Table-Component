"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"

export default function CalendarCustomDays() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 11, 8),
    to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
  })

  return (
    <DropdownMenuSubContent className="translate-x-10 sticky">
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={setRange}
        numberOfMonths={1}
        captionLayout="dropdown"
        className="[&_button]:h-10 [&_button]:w-10 [&_tr]:mt-0 [&_tr]:space-x-2 [&_tr]:space-y-2 [&_button]:text-sm"
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
