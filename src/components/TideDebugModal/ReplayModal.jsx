import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { filterJson } from '../../utils/filterJson';

const ReplayModal = ({ replayModal, setReplayModal, theme }) => {
    const [responseHeadersFilter, setResponseHeadersFilter] = useState('');
    const [responseFilter, setResponseFilter] = useState('');

    const getJsonTheme = () => theme === 'monokai' ? 'monokai' : theme === 'normal' ? 'rjv-default' : 'monokai';
    const getJsonStyle = () => ({ background: theme === 'normal' ? '#fff' : '#282a36', borderRadius: '5px' });

    return (
        <div className={`replay-modal theme-${theme}`}>
            <div className="modal-content">
                <h3 className="tide-server-modal-title">Replay Result</h3>
                {replayModal.error ? (
                    <div className="replay-error">
                        <p><strong>Error:</strong> {replayModal.error}</p>
                    </div>
                ) : (
                    <>
                        <p><strong>Status:</strong> {replayModal.status} {replayModal.statusText}</p>
                        <p><strong>Response Headers:</strong></p>
                        <input
                            type="text"
                            placeholder="Filter response headers..."
                            value={responseHeadersFilter}
                            onChange={(e) => setResponseHeadersFilter(e.target.value)}
                            className="json-filter"
                        />
                        <ReactJson
                            src={filterJson(replayModal.responseHeaders || {}, responseHeadersFilter)}
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
                            src={filterJson(replayModal.response || {}, responseFilter)}
                            theme={getJsonTheme()}
                            collapsed={true}
                            style={getJsonStyle()}
                        />
                    </>
                )}
                <button className="close-btn" onClick={() => setReplayModal(null)}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default ReplayModal;