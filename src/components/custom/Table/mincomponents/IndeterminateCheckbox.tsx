import type { IndeterminateCheckboxProps } from "@/lib/types"
import { useEffect, useRef } from "react"

export default function IndeterminateCheckbox({
  indeterminate,
  onChange,
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
      onChange={(e) => onChange?.(e.target.checked)}
      {...rest}
    />
  )
}