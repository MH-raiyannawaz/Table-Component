import { DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useEffect, useState } from 'react'
import type { MenuItem } from '../../../../components/custom/Table/types'
import { Button } from '@/components/ui/button'

export default function RangeFilter({ menuItem }: { menuItem: MenuItem }) {

  const min = Number(menuItem.range?.min)
  const max = Number(menuItem.range?.max)
  const currMin = Number(menuItem.range?.currMin)
  const currMax = Number(menuItem.range?.currMax)

  const [range, setRange] = useState([currMin, currMax])

   useEffect(() => {
    setRange([currMin, currMax])
  }, [currMin, currMax])

  return (
    <DropdownMenuSubContent avoidCollisions>
      <div className="bg-white w-44 h-28 flex flex-col items-center p-2">
        <Label className='py-2'>Select Range</Label>
        <div className="flex justify-between w-full mb-3">
          <span>{range[0]}</span>
          <span>{range[1]}</span>
        </div>
        <Slider
          value={range}
          onValueChange={(e) => {
            setRange(e)
          }}
          onValueCommit={()=>menuItem.onClick(range)}
          min={min}
          max={max}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          step={1}
          className="mx-auto w-11/12"
        />
      </div>
      <Button onClick={()=>menuItem.onClick(range)}>Done</Button>
    </DropdownMenuSubContent>
  )
}
