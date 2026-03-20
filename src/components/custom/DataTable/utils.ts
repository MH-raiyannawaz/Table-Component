import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"
import { isValidElement } from "react"
import type { Data, FilterType, MenuSubItem, Range } from "./types"

/**
 * Whether a column should appear in the filter UI: every non-nullish value must be
 * `string`, `number`, or `boolean` (no objects, arrays, React nodes, Dates, etc.),
 * and at least one non-empty scalar value must exist in the sample.
 */
export function isColumnFilterableScalarField(values: unknown[]): boolean {
  let hasFilterableValue = false
  for (const v of values) {
    if (v === null || v === undefined) continue
    if (typeof v === "string") {
      if (v.trim() !== "") hasFilterableValue = true
      continue
    }
    if (typeof v === "number") {
      if (!Number.isNaN(v)) hasFilterableValue = true
      continue
    }
    if (typeof v === "boolean") {
      hasFilterableValue = true
      continue
    }
    if (isValidElement(v)) return false
    return false
  }
  return hasFilterableValue
}

export const getPinnedColumnStyle = <TData, TValue>(column: Column<TData, TValue>, tableType: string): CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? column.getStart('left') : undefined,
    right: isPinned === 'right' ? column.getAfter('right') : undefined,
    zIndex: isPinned ? 3 : 0,
    width: '100%',
    background: tableType === 'row' && isPinned ? 'white' : ''
  }
}

export const getMappedData = (data: Data[]) => {
  return data.map((d: Data) =>
    Object.fromEntries(
      Object.entries(d).filter(([_, value]) =>
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      )
    )
  )
}

/** Row shape when expanded for multi-value column (internal) */
export type ExpandedRow = Data & { __physicalIndex__?: number; __groupSize__?: number }

/**
 * Expands rows so that when a row has multiple emails (e.g. emails: string[]),
 * it becomes N physical rows. Non-email columns get rowSpan=N; email column shows one value per row.
 * @param data - Rows that may have `emails: string[]` or `email: string`
 * @param multiValueKey - Key for the array of values (e.g. 'emails'). Single-value key will be 'email'.
 */
export function expandRowsForMultiValue (
  data: Data[],
  multiValueKey: string = 'emails'
): ExpandedRow[] {
  const singleKey = multiValueKey.endsWith('s') ? multiValueKey.slice(0, -1) : multiValueKey + 'Value'
  const result: ExpandedRow[] = []
  for (const row of data) {
    let raw = row[multiValueKey]
    if (raw == null && row[singleKey] != null) raw = row[singleKey]
    const arr = Array.isArray(raw) ? raw : raw != null ? [raw] : []
    if (arr.length > 1) {
      const rest = { ...row } as Record<string, unknown>
      delete rest[multiValueKey]
      for (let i = 0; i < arr.length; i++) {
        result.push({
          ...rest,
          [singleKey]: arr[i],
          __physicalIndex__: i,
          __groupSize__: arr.length,
        } as ExpandedRow)
      }
    } else {
      const single = arr[0]
      const rest = { ...row } as Record<string, unknown>
      delete rest[multiValueKey]
      result.push({
        ...rest,
        [singleKey]: single,
      } as ExpandedRow)
    }
  }
  return result
}

export const getFilterType = (dataType: any): FilterType => {

  const isDateType =
    typeof dataType === "string" &&
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(dataType) &&
    !isNaN(new Date(dataType).getTime())

  if (isDateType) {
    return 'date'
  }

  let isBoolean = typeof dataType === 'boolean'
  if (isBoolean) {
    return 'boolean'
  }

  let isRange = dataType !== '' && !isNaN(Number(dataType))
  if (isRange) {
    return 'number'
  }

  return 'string'
}

export const getFilterData = (filterSubItems: string[]): {
  filterType: FilterType,
  subItems?: MenuSubItem[] | null,
  range?: Range | null
} => {

  let dataType = getFilterType(filterSubItems.map(filterSubItem => filterSubItem).filter(filterSubItem => filterSubItem)[0]);

  if (dataType === 'date') {

    if (!Array.isArray(filterSubItems) || filterSubItems.length === 0) {
      return { filterType: "date", subItems: null, range: null }
    }

    const parsed = filterSubItems
      .map(item => new Date(item as string))
      .filter(d => !isNaN(d.valueOf()))

    if (parsed.length === 0) {
      return { filterType: "date", subItems: null, range: null }
    }

    const timestamps = parsed.map(d => d.getTime())

    const from = new Date(Math.min(...timestamps))
    const to = new Date(Math.max(...timestamps))

    return { filterType: 'date', subItems: null, range: { from, to } }
  }

  // Range 
  if (dataType === 'number') {
    let lowestRange = Math.min(...filterSubItems.map(filterItem => Number(filterItem)))
    let highestRange = Math.max(...filterSubItems.map(filterItem => Number(filterItem)))

    let range = {
      currMin: Number(lowestRange), currMax: Number(highestRange),
      min: Number(lowestRange), max: Number(highestRange)
    }
    return { filterType: 'number', subItems: null, range }
  }
  // Range 

  // BOOLEAN 
  if (dataType === 'boolean') {
    return {
      filterType: 'boolean',
      subItems: [
        { id: 'true', label: 'true', checked: false },
        { id: 'false', label: 'false', checked: false }
      ],
      range: null
    }
  }
  // BOOLEAN 

  const filteredSubItems = Array.from(
    filterSubItems.reduce((map, item) => {
      // If item is a string, convert it to proper object structure
      const subItem = typeof item === 'string'
        ? { id: item, label: item, checked: false }
        : item

      const existing = map.get(subItem.id)
      // If item is checked OR no existing item, use this one
      if (subItem.checked || !existing) {
        map.set(subItem.id, subItem)
      }
      return map
    }, new Map()).values()
  )


  return { filterType: 'string', subItems: filteredSubItems, range: null }

  // let isDateType = dataType !== '' && !isNaN(Date.parse(dataType))

  // return filterType
}