export const filterJson = (data, search) => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();

    const filterObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
            return String(obj).toLowerCase().includes(lowerSearch) ? obj : undefined;
        }

        const filtered = {};
        let hasMatch = false;

        for (const [key, value] of Object.entries(obj)) {
            const keyMatch = key.toLowerCase().includes(lowerSearch);
            const filteredValue = filterObject(value);

            if (keyMatch || filteredValue !== undefined) {
                filtered[key] = filteredValue !== undefined ? filteredValue : value;
                hasMatch = true;
            }
        }

        return hasMatch ? filtered : undefined;
    };

    const result = filterObject(data);
    return result !== undefined ? result : {};
};