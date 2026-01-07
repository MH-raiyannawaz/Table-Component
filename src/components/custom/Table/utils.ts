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

const handleCopyDataID = async (id: string) => {
    await navigator.clipboard.writeText(id)
}