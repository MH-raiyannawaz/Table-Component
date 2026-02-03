import * as XLSX from "xlsx";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Table } from "@tanstack/react-table";
import type { Data } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
const CHAR_WIDTH = 10;
const MIN_COL_WIDTH = 100;
const MAX_COL_WIDTH = 400;

function getColumnWidthFromData<T>(
    data: T[],
    field: keyof T
) {
    const maxLength = Math.max(
        ...data.map((row) => String(row[field] ?? "").length),
        String(field).length
    );

    return Math.min(
        Math.max(maxLength * CHAR_WIDTH, MIN_COL_WIDTH),
        MAX_COL_WIDTH
    );
}

export const handleCopyDataID = async (id: string) => {
    await navigator.clipboard.writeText(id)
}


export function exportToExcel<T extends Record<string, any>>(data: T[], filename = "data.xlsx") {
    if (!data || data.length === 0) {
        console.warn("exportToExcel: no data to export");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, filename);
}

export const handleDownloadExcel = (table: Table<Data>, data: Data[]) => {
    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

    if (selectedRows.length > 0) {
        exportToExcel(selectedRows)
    }
    else {
        exportToExcel(data)
    }
}

export async function getData(url: string) {
    const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const json = await res.json();

    return json
}