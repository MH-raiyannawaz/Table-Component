import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"
import type { FilterType, MenuSubItem, Range } from "./types"

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
export type FilterType = 'date' | 'number' | 'boolean' | 'string'

const isValidDate = (value: unknown): boolean => {
  if (value instanceof Date && !isNaN(value.getTime())) return true

  if (typeof value === 'string') {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  return false
}

const isNumber = (value: unknown): boolean => {
  if (typeof value === 'number') return !isNaN(value)

  if (typeof value === 'string' && value.trim() !== '') {
    return !isNaN(Number(value))
  }

  return false
}

const isBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return true

  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    return ['true', 'false', 'yes', 'no', '1', '0'].includes(v)
  }

  if (typeof value === 'number') {
    return value === 0 || value === 1
  }

  return false
}

export const getFilterType = (value: unknown): FilterType => {
  if (isBoolean(value)) return 'boolean'
  if (isValidDate(value)) return 'date'
  if (isNumber(value)) return 'number'
  return 'string'
}


export const getFilterData = (filterSubItems: MenuSubItem[]): {
  filterType: FilterType,
  subItems?: MenuSubItem[] | null,
  range?: Range | null
} => {

  // Categorical 
  // let categoricalMappedData = [...new Map(filterSubItems.map(filterSubItem => [filterSubItem.label, filterSubItem])).values()]
  // let isCategorical = categoricalMappedData.length / filterSubItems.length < 0.25

  // if (isCategorical) {
  //   return { filterType: 'categorical', subItems: categoricalMappedData, range: null }
  // }
  // // Categorical 

  let dataType = getFilterType(filterSubItems.map(filterSubItem => filterSubItem?.label)[0]);

  if (dataType === 'date') {

    if (!Array.isArray(filterSubItems) || filterSubItems.length === 0) {
      return { filterType: "date", subItems: null, range: null }
    }

    const parsed = filterSubItems
      .map(item => new Date(item.label as string))
      .filter(d => !isNaN(d.valueOf()))

    if (parsed.length === 0) {
      return { filterType: "date", subItems: null, range: null }
    }

    const timestamps = parsed.map(d => d.getTime())

    const min = new Date(Math.min(...timestamps))
    const max = new Date(Math.max(...timestamps))

    return { filterType: 'date', subItems: null, range: { min, max } }
  }
  // Date Type 

  // Range 
  if (dataType === 'number') {
    let lowestRange = Math.min(...filterSubItems.map(filterItem => Number(filterItem.label)))
    let highestRange = Math.max(...filterSubItems.map(filterItem => Number(filterItem.label)))

    let range = {
      currMin: Number(lowestRange), currMax: Number(highestRange),
      min: Number(lowestRange), max: Number(highestRange)
    }
    return { filterType: 'number', subItems: null, range }
  }
  // Range 

  let filteredSubItems = [...new Map(filterSubItems.map(filterSubItem => [filterSubItem.label, filterSubItem])).values()]

  return { filterType: 'select', subItems: filteredSubItems, range: null }

  // let isDateType = dataType !== '' && !isNaN(Date.parse(dataType))

  // return filterType
}