import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { filterJson } from '../../utils/filterJson';

const RequestSender = ({ theme, setRequests }) => {
    const [method, setMethod] = useState('GET');
    const [endpoint, setEndpoint] = useState('');
    const [queryParams, setQueryParams] = useState([]);
    const [payload, setPayload] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [responseFilter, setResponseFilter] = useState('');

    const updateEndpointWithParams = (newParams, baseEndpoint = endpoint.split('?')[0]) => {
        const queryString = newParams
            .filter(({ key, value }) => key && value)
            .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        setEndpoint(queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint);
    };

    const handleEndpointChange = (e) => {
        const value = e.target.value;
        setEndpoint(value);
        const [queryString] = value.split('?');
        if (queryString) {
            const params = new URLSearchParams(queryString);
            const newQueryParams = [];
            const seenKeys = new Set();
            for (const [key, val] of params.entries()) {
                const isArrayParam = key.endsWith('[]') || (seenKeys.has(key) && !key.endsWith('[]'));
                const paramKey = isArrayParam && !key.endsWith('[]') ? `${key}[]` : key;
                newQueryParams.push({ key: paramKey, value: val });
                seenKeys.add(key.endsWith('[]') ? key.slice(0, -2) : key);
            }
            setQueryParams(newQueryParams);
        } else if (queryString === '' && queryParams.length > 0) {
            setQueryParams([]);
        }
    };

    const addQueryParam = () => {
        const newParams = [...queryParams, { key: '', value: '' }];
        setQueryParams(newParams);
        updateEndpointWithParams(newParams);
    };

    const updateQueryParam = (index, field, value) => {
        const newParams = [...queryParams];
        const oldKey = newParams[index].key;
        newParams[index][field] = value;
        if (field === 'key' && oldKey.endsWith('[]')) {
            const baseOldKey = oldKey.slice(0, -2);
            const otherArrayParams = newParams.filter((p, i) => i !== index && p.key === oldKey).length;
            if (value === baseOldKey && otherArrayParams > 0) {
                newParams[index].key = `${value}[]`;
            }
        }
        setQueryParams(newParams);
        updateEndpointWithParams(newParams);
    };

    const removeQueryParam = (index) => {
        const newParams = queryParams.filter((_, i) => i !== index);
        setQueryParams(newParams);
        updateEndpointWithParams(newParams);
    };

    const sendRequest = async () => {
        setIsLoading(true);
        setResponse(null);
        try {
            const host = localStorage.getItem('host') || '';
            const token = localStorage.getItem('tideApiToken') || '';
            const url = `${host}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            const options = {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            if (payload && method !== 'GET') {
                try {
                    options.body = JSON.stringify(JSON.parse(payload));
                } catch {
                    options.body = payload;
                }
            }
            const startTime = performance.now();
            const res = await fetch(url, options);
            const endTime = performance.now();
            const responseHeaders = Object.fromEntries(res.headers.entries());
            const responseData = await res.json().catch(() => res.statusText);
            const requestData = {
                url,
                method,
                status: res.status,
                statusText: res.statusText,
                duration: (endTime - startTime).toFixed(2),
                requestHeaders: options.headers,
                requestBody: options.body || null,
                responseHeaders,
                response: responseData,
                timestamp: new Date().toLocaleTimeString(),
            };
            setResponse(requestData);
            setRequests((prev) => [requestData, ...prev].slice(0, 20));
        } catch (error) {
            setResponse({
                error: error.message,
                timestamp: new Date().toLocaleTimeString(),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="request-sender">
            <h3>Send Custom Request</h3>
            <div className="request-form">
                <select value={method} onChange={(e) => setMethod(e.target.value)} disabled={isLoading}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <input
                    type="text"
                    placeholder="/relative/endpoint?param=value"
                    value={endpoint}
                    onChange={handleEndpointChange}
                    disabled={isLoading}
                />
                <button onClick={sendRequest} disabled={isLoading || !endpoint}>
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </div>
            {queryParams.length > 0 && (
                <div className="query-params">
                    <h4>Query Parameters</h4>
                    {queryParams.map((param, index) => (
                        <div key={index} className="param-row">
                            <input
                                type="text"
                                placeholder="Key"
                                value={param.key}
                                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                                disabled={isLoading}
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={param.value}
                                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                                disabled={isLoading}
                            />
                            <button onClick={() => removeQueryParam(index)} disabled={isLoading} className="remove-btn">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={addQueryParam} disabled={isLoading} className="add-param-btn">
                Add Parameter
            </button>
            {(method === 'POST' || method === 'PUT') && (
                <textarea
                    placeholder="Request payload (JSON or text)"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                />
            )}
            {response && (
                <div className="response-preview">
                    <input
                        type="text"
                        placeholder="Filter response..."
                        value={responseFilter}
                        onChange={(e) => setResponseFilter(e.target.value)}
                        className="json-filter"
                    />
                    <ReactJson
                        src={filterJson(response, responseFilter)}
                        theme={theme === 'monokai' ? 'monokai' : theme === 'normal' ? 'rjv-default' : 'monokai'}
                        style={{ background: theme === 'normal' ? '#fff' : '#282a36', borderRadius: '5px' }}
                        sortKeys={true}
                    />
                </div>
            )}
        </div>
    );
};

export default RequestSender;