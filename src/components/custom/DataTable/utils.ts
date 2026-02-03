import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"
import type { Data, FilterType, MenuSubItem, Range } from "./types"

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

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value

  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    if (['true', 'yes', '1'].includes(v)) return true
    if (['false', 'no', '0'].includes(v)) return false
  }

  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }

  return null
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
  subItems?: MenuSubItem[] | string | null,
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
        { id: '1', label: String(true), isActive: false },
        { id: '2', label: String(false), isActive: false }
      ],
      range: null
    }
  }
  // BOOLEAN 

  const filteredSubItems = [
    ...new Map(filterSubItems.map(item => [item.id, item])).values()
  ]


  return { filterType: 'string', subItems: filteredSubItems, range: null }

  // let isDateType = dataType !== '' && !isNaN(Date.parse(dataType))

  // return filterType
}