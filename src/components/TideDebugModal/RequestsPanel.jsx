import React from 'react';

const RequestsPanel = ({ filteredRequests, setSelectedRequest, truncateString, filterType, setFilterType, methodFilter, setMethodFilter, setSearchTerm, searchTerm }) => (
    <div className="requests-column">
        <input
            type="text"
            placeholder="Filter requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
        />
        <div className="filter-buttons">
            <div className="filter-buttons-group">
                <button
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    All Requests
                </button>
                <button
                    className={`filter-btn ${filterType === 'errors' ? 'active' : ''}`}
                    onClick={() => setFilterType('errors')}
                >
                    Errors
                </button>
                <button
                    className={`filter-btn ${filterType === 'success' ? 'active' : ''}`}
                    onClick={() => setFilterType('success')}
                >
                    Success
                </button>
            </div>
            <div className="filter-buttons-group">
                <button
                    className={`filter-btn ${methodFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setMethodFilter('all')}
                >
                    All Methods
                </button>
                <button
                    className={`filter-btn ${methodFilter === 'GET' ? 'active' : ''}`}
                    onClick={() => setMethodFilter('GET')}
                >
                    GET
                </button>
                <button
                    className={`filter-btn ${methodFilter === 'POST' ? 'active' : ''}`}
                    onClick={() => setMethodFilter('POST')}
                >
                    POST
                </button>
                <button
                    className={`filter-btn ${methodFilter === 'PUT' ? 'active' : ''}`}
                    onClick={() => setMethodFilter('PUT')}
                >
                    PUT
                </button>
                <button
                    className={`filter-btn ${methodFilter === 'DELETE' ? 'active' : ''}`}
                    onClick={() => setMethodFilter('DELETE')}
                >
                    DELETE
                </button>
            </div>
        </div>
        <div className="requests-container">
            <table className="requests-table">
                <thead>
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Duration</th>
                </tr>
                </thead>
                <tbody>
                {filteredRequests.map((req, index) => (
                    <tr
                        key={index}
                        className={`status-${Math.floor(req.status / 100) * 100}`}
                        onClick={() => setSelectedRequest(req)}
                    >
                        <td>{req.method}</td>
                        <td>{truncateString(req.url.split('/').pop() || '/')}</td>
                        <td>{req.status}</td>
                        <td>{req.timestamp}</td>
                        <td>{parseInt(req.duration)}ms</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default RequestsPanel;