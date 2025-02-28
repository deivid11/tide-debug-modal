import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { filterJson } from '../../utils/filterJson';

const DetailsModal = ({ selectedRequest, setSelectedRequest, dumpData, theme, generateCurlCommand, replayRequest }) => {
    const [requestHeadersFilter, setRequestHeadersFilter] = useState('');
    const [requestBodyFilter, setRequestBodyFilter] = useState('');
    const [responseHeadersFilter, setResponseHeadersFilter] = useState('');
    const [responseFilter, setResponseFilter] = useState('');

    const getJsonTheme = () => theme === 'monokai' ? 'monokai' : theme === 'normal' ? 'rjv-default' : 'monokai';

    const getJsonStyle = () => ({ background: theme === 'normal' ? '#fff' : '#282a36', borderRadius: '5px' });

    return (
        <div className={`tide-server-details-modal full-page theme-${theme}`}>
            <div className="modal-content">
                <h3 className="tide-server-modal-title">Request Breakdown</h3>
                <div className="details-content">
                    <div className="meta-info">
                        <p><strong>URL:</strong> {selectedRequest.url}</p>
                        <p><strong>Method:</strong> {selectedRequest.method}</p>
                        <p><strong>Status:</strong> {selectedRequest.status} {selectedRequest.statusText}</p>
                        <p><strong>Duration:</strong> {selectedRequest.duration}ms</p>
                        <p><strong>Request Headers:</strong></p>
                        <input
                            type="text"
                            placeholder="Filter request headers..."
                            value={requestHeadersFilter}
                            onChange={(e) => setRequestHeadersFilter(e.target.value)}
                            className="json-filter"
                        />
                        <ReactJson
                            src={filterJson(selectedRequest.requestHeaders || {}, requestHeadersFilter)}
                            theme={getJsonTheme()}
                            collapsed={true}
                            style={getJsonStyle()}
                        />
                        <p><strong>Request Body:</strong></p>
                        <input
                            type="text"
                            placeholder="Filter request body..."
                            value={requestBodyFilter}
                            onChange={(e) => setRequestBodyFilter(e.target.value)}
                            className="json-filter"
                        />
                        <ReactJson
                            src={filterJson(selectedRequest.requestBody ? JSON.parse(selectedRequest.requestBody) : {}, requestBodyFilter)}
                            theme={getJsonTheme()}
                            style={getJsonStyle()}
                        />
                        <p><strong>Response Headers:</strong></p>
                        <input
                            type="text"
                            placeholder="Filter response headers..."
                            value={responseHeadersFilter}
                            onChange={(e) => setResponseHeadersFilter(e.target.value)}
                            className="json-filter"
                        />
                        <ReactJson
                            src={filterJson(selectedRequest.responseHeaders || {}, responseHeadersFilter)}
                            theme={getJsonTheme()}
                            collapsed={true}
                            style={getJsonStyle()}
                        />
                        <p><strong>Response:</strong></p>
                        <input
                            type="text"
                            placeholder="Filter response..."
                            value={responseFilter}
                            onChange={(e) => setResponseFilter(e.target.value)}
                            className="json-filter"
                        />
                        <ReactJson
                            src={filterJson(selectedRequest.response || {}, responseFilter)}
                            theme={getJsonTheme()}
                            style={getJsonStyle()}
                        />
                        {selectedRequest.profilerLink && (
                            <>
                                <p><strong>Dump Output:</strong></p>
                                {dumpData.length > 0 ? (
                                    dumpData.map((dump, index) => (
                                        <div key={index} className="dump-item">
                                            <p><strong>File:</strong> {dump.file} - <strong>Line:</strong> {dump.line}</p>
                                            <div dangerouslySetInnerHTML={{ __html: dump.content }} className="sf-dump-container" />
                                        </div>
                                    ))
                                ) : (
                                    <p>No dump data available.</p>
                                )}
                            </>
                        )}
                        <button className="curl-btn" onClick={() => generateCurlCommand(selectedRequest)}>
                            Copy as cURL
                        </button>
                        <button className="replay-btn" onClick={() => replayRequest(selectedRequest)}>
                            Replay Request
                        </button>
                    </div>
                    {selectedRequest.profilerLink && (
                        <div className="profiler-iframe">
                            <h4>Symfony Profiler</h4>
                            <iframe
                                src={selectedRequest.profilerLink}
                                title="Symfony Profiler"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                            />
                        </div>
                    )}
                </div>
                <button className="close-btn" onClick={() => setSelectedRequest(null)}>
                    Exit
                </button>
            </div>
        </div>
    );
};

export default DetailsModal;