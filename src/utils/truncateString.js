export const truncateString = (str, maxLength = 50) =>
    str.length > maxLength ? `${str.slice(0, 48)}...` : str;