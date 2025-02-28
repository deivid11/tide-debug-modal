import React, { useState, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import RequestsPanel from './RequestsPanel';
import RequestSender from './RequestSender';
import TerminalPanel from './TerminalPanel';
import DetailsModal from './DetailsModal';
import ReplayModal from './ReplayModal';
import { truncateString } from '../../utils/truncateString';
import { generateCurlCommand } from '../../utils/generateCurlCommand';
import './TideDebugModal.scss';

const TideDebugModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('debugSearchTerm') || '');
    const [filterType, setFilterType] = useState(() => localStorage.getItem('debugFilterType') || 'all');
    const [methodFilter, setMethodFilter] = useState(() => localStorage.getItem('debugMethodFilter') || 'all');
    const [dumpData, setDumpData] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('debugTheme') || 'dark');
    const [replayModal, setReplayModal] = useState(null);
    const [kaboom, setKaboom] = useState(false);

    const isDev = import.meta.env.VITE_BUILD === 'dev';
    const hasError = requests.some(req => req.status >= 400);

    useEffect(() => {
        localStorage.setItem('debugSearchTerm', searchTerm);
        localStorage.setItem('debugFilterType', filterType);
        localStorage.setItem('debugMethodFilter', methodFilter);
        localStorage.setItem('debugTheme', theme);
    }, [searchTerm, filterType, methodFilter, theme]);

    useEffect(() => {
        if (!isDev) return;

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const options = args[1] || {};
            const requestHeaders = options.headers ? Object.fromEntries(new Headers(options.headers).entries()) : {};
            const response = await originalFetch(...args);
            const endTime = performance.now();

            const clonedResponse = response.clone();
            const responseHeaders = Object.fromEntries(clonedResponse.headers.entries());
            const profilerLink = responseHeaders['x-debug-token-link'];

            const requestData = {
                url: args[0],
                method: options.method || 'GET',
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                duration: (endTime - startTime).toFixed(2),
                profilerLink: profilerLink || null,
                requestHeaders,
                requestBody: options.body || null,
                responseHeaders,
                response: await clonedResponse.json().catch(() => clonedResponse.statusText),
                timestamp: new Date().toLocaleTimeString(),
            };

            setRequests((prev) => {
                const newRequests = [requestData, ...prev].slice(0, 20);
                if (requestData.status >= 400 && !prev.some(req => req.status >= 400)) {
                    setKaboom(true);
                    setTimeout(() => setKaboom(false), 1000);
                }
                return newRequests;
            });

            return response;
        };

        const ws = new WebSocket('ws://localhost:5174');
        ws.onmessage = (event) => {
            const message = event.data?.trim();
            if (
                message &&
                !message.includes('Connected to Vite log stream') &&
                !message.includes('Disconnected from Vite log stream') &&
                !message.includes('WebSocket error:') &&
                (message.startsWith('[log]') || message.startsWith('[error]') || message.startsWith('[WARN]') || message.startsWith('[ERROR]')) &&
                message.replace(/\[log\]|\[error\]|\[WARN\]|\[ERROR\]/, '').trim().length > 0 &&
                (!terminalLogs.length || terminalLogs[terminalLogs.length - 1] !== message)
            ) {
                setTerminalLogs((prev) => [...prev, message].slice(-50));
            }
        };

        return () => {
            window.fetch = originalFetch;
            ws.close();
        };
    }, [isDev, terminalLogs]);

    useEffect(() => {
        if (!selectedRequest || !selectedRequest.profilerLink) {
            setDumpData([]);
            return;
        }

        const fetchDumpData = async () => {
            try {
                const dumpUrl = `${selectedRequest.profilerLink}?panel=dump`;
                const response = await fetch(dumpUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const dumpElements = doc.querySelectorAll('pre.sf-dump');

                const dumps = Array.from(dumpElements).map((el) => {
                    let file = 'Unknown', line = 'Unknown';
                    const infoPiece = el.closest('.sf-toolbar-info-piece');
                    if (infoPiece) {
                        const fileLink = infoPiece.querySelector('a');
                        if (fileLink) file = fileLink.textContent || fileLink.getAttribute('title') || 'Unknown';
                        const lineSpan = infoPiece.querySelector('.sf-toolbar-file-line');
                        if (lineSpan) line = lineSpan.textContent.replace('line ', '') || 'Unknown';
                        else {
                            const spans = infoPiece.querySelectorAll('span');
                            spans.forEach((span) => {
                                if (span.textContent.includes('line ')) line = span.textContent.replace('line ', '') || 'Unknown';
                            });
                        }
                    } else {
                        let sibling = el.previousElementSibling;
                        while (sibling) {
                            if (sibling.classList.contains('sf-toolbar-file-line')) line = sibling.textContent.replace('line ', '') || 'Unknown';
                            else if (sibling.textContent.includes('line ')) line = sibling.textContent.replace('line ', '') || 'Unknown';
                            if (sibling.querySelector('a')) {
                                const fileLink = sibling.querySelector('a');
                                file = fileLink.textContent || fileLink.getAttribute('title') || 'Unknown';
                            }
                            sibling = sibling.previousElementSibling;
                        }
                    }
                    return { content: el.outerHTML, file, line };
                });

                setDumpData(dumps);
            } catch (error) {
                console.error('Error fetching dump data:', error);
                setDumpData([]);
            }
        };

        fetchDumpData();
    }, [selectedRequest]);

    useEffect(() => {
        if (!isDev) return;

        const handleKeyDown = (event) => {
            if (event.altKey && event.keyCode === 83) {
                if (isOpen || selectedRequest || replayModal) {
                    setIsOpen(false);
                    setSelectedRequest(null);
                    setReplayModal(null);
                } else {
                    setIsOpen(true);
                }
                event.preventDefault();
            }
            if (event.altKey && event.keyCode === 68) {
                setIsOpen(prev => !prev);
                event.preventDefault();
            }
            if (event.altKey && event.keyCode === 90) {
                setRequests([]);
                setTerminalLogs([]);
            }
            if (event.altKey && event.keyCode === 69) {
                if (isOpen) {
                    setIsOpen(false);
                    setSelectedRequest(null);
                    setReplayModal(null);
                } else {
                    const lastErroredRequest = requests.find(req => req.status >= 400);
                    if (lastErroredRequest) {
                        if (!isOpen) setIsOpen(true);
                        setSelectedRequest(lastErroredRequest);
                    }
                }
                event.preventDefault();
            }
            if (event.key === 'Escape') {
                if (replayModal) setReplayModal(null);
                else if (selectedRequest) setSelectedRequest(null);
                else if (isOpen) setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDev, isOpen, selectedRequest, replayModal, requests]);

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.status.toString().includes(searchTerm);
        const matchesStatus =
            filterType === 'all' ||
            (filterType === 'errors' && req.status >= 400) ||
            (filterType === 'success' && req.status < 400);
        const matchesMethod =
            methodFilter === 'all' ||
            req.method.toUpperCase() === methodFilter.toUpperCase();
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const exportRequestsToJson = () => {
        const dataStr = JSON.stringify(filteredRequests, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `requests_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const replayRequest = async (req) => {
        try {
            const options = {
                method: req.method,
                headers: req.requestHeaders || {},
            };
            if (req.requestBody) options.body = req.requestBody;
            const response = await fetch(req.url, options);
            const responseHeaders = Object.fromEntries(response.headers.entries());
            const data = await response.json().catch(() => response.statusText);
            setReplayModal({
                status: response.status,
                statusText: response.statusText,
                responseHeaders,
                response: data,
            });
            setRequests((prev) => [
                {
                    ...req,
                    status: response.status,
                    statusText: response.statusText,
                    responseHeaders,
                    response: data,
                    timestamp: new Date().toLocaleTimeString(),
                },
                ...prev.slice(1),
            ]);
        } catch (error) {
            setReplayModal({ error: error.message });
        }
    };

    const getThemeClass = () => theme;

    if (!isDev) return null;

    return (
        <>
            <button
                className={`tide-server-debug-toggle theme-${getThemeClass()} ${hasError ? 'error' : ''} ${kaboom ? 'kaboom' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                ⚡
            </button>

            {isOpen && (
                <div className={`tide-server-debug-modal theme-${getThemeClass()}`}>
                    <div className="modal-content">
                        <ThemeSelector theme={theme} setTheme={setTheme} />
                        <div className="debug-columns">
                            <RequestsPanel
                                filteredRequests={filteredRequests}
                                setSelectedRequest={setSelectedRequest}
                                truncateString={truncateString}
                                filterType={filterType}
                                setFilterType={setFilterType}
                                methodFilter={methodFilter}
                                setMethodFilter={setMethodFilter}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                            <TerminalPanel logs={terminalLogs} />
                        </div>
                        <div className="debug-columns">
                            <RequestSender theme={theme} setRequests={setRequests} />
                        </div>
                        <div className="action-buttons">
                            <button className="export-btn" onClick={exportRequestsToJson}>
                                Export requests to JSON
                            </button>
                            <button className="clear-btn" onClick={() => { setRequests([]); setTerminalLogs([]); }}>
                                Clear
                            </button>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <DetailsModal
                    selectedRequest={selectedRequest}
                    setSelectedRequest={setSelectedRequest}
                    dumpData={dumpData}
                    theme={theme}
                    generateCurlCommand={generateCurlCommand}
                    replayRequest={replayRequest}
                />
            )}

            {replayModal && (
                <ReplayModal replayModal={replayModal} setReplayModal={setReplayModal} theme={theme} />
            )}
        </>
    );
};

export default TideDebugModal;