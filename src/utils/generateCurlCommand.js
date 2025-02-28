export const generateCurlCommand = (req) => {
    const headerString = Object.entries(req.requestHeaders || {})
        .map(([key, value]) => `-H "${key}: ${value}"`)
        .join(' ');
    const bodyString = req.requestBody ? `-d '${req.requestBody}'` : '';
    const curl = `curl -X ${req.method} "${req.url}" ${headerString} ${bodyString}`.trim();
    navigator.clipboard.writeText(curl);
    alert('cURL command copied to clipboard:\n' + curl);
};