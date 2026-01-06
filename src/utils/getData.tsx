const getData = async (url: string) => {
    let response = await fetch(url)
    let jsData = await response.json()

    if (Array.isArray(jsData)) {
        return {data: jsData, total: 0}
    }

    if (jsData && typeof jsData === 'object') {
        // Find the first array inside the object
        const arrayValue = Object.values(jsData).find(
            value => Array.isArray(value)
        )

        if (arrayValue) {
            return {data: arrayValue, total: jsData.total}
        }
    }

    return { data: [], total: 0 }
}

export default getData