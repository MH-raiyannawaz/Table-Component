import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"
import type { MenuSubItem, Range } from "./types"

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

  export  const getFilterDataType = (filterSubItems: MenuSubItem[]): {
    filterType: string,
    subItems?: MenuSubItem[] | null,
    range?: Range | null
  } => {

    // Categorical 
    let categoricalMappedData = [...new Map(filterSubItems.map(filterSubItem => [filterSubItem.label, filterSubItem])).values()]
    let isCategorical = categoricalMappedData.length / filterSubItems.length < 0.25

    if (isCategorical) {
      return { filterType: 'categorical', subItems: categoricalMappedData, range: null }
    }
    // // Categorical 

    let dataType = filterSubItems.map(filterSubItem => filterSubItem.label)[0];

    // Date Type 
    let isDateType = typeof dataType === 'string' && /\d{2,4}[-/]\d{1,2}[-/]\d{1,2}/.test(dataType)

    if (isDateType) {

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

      return { filterType: 'date', subItems: null, range: {min, max} }
    }
    // Date Type 

    let isRange = dataType !== '' && !isNaN(Number(dataType))

    // Range 
    if (isRange) {
      let lowestRange = Math.min(...filterSubItems.map(filterItem => Number(filterItem.label)))
      let highestRange = Math.max(...filterSubItems.map(filterItem => Number(filterItem.label)))

      let range = { min: Number(lowestRange), max: Number(highestRange) }
      return { filterType: 'range', subItems: null, range }
    }
    // Range 

    return { filterType: 'select', subItems: filterSubItems, range: null }

    // let isDateType = dataType !== '' && !isNaN(Date.parse(dataType))

    // return filterDataType
  }