import type { IndeterminateCheckboxProps } from '../DataTable/types'
import { useEffect, useRef } from "react"

export default function IndeterminateCheckbox({
  indeterminate,
  isHeader = false,
  onCheck,
  className = "",
  ...rest
}: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [indeterminate, rest.checked])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      onChange={ isHeader ? onCheck : (e) => onCheck?.(e.target.checked)}
      {...rest}
    />
  )
}