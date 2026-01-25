import { DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

export default function RangeFilter({ min, max }: { min: number, max: number }) {

  const [range, setRange] = useState([min, max])

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
          onValueChange={setRange}
          min={min}
          max={max}
          step={1}
          className="mx-auto w-11/12"
        />
      </div>
    </DropdownMenuSubContent>
  )
}
