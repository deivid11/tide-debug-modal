import React, { useEffect, useRef } from 'react';

const TerminalPanel = ({ logs }) => {
    const logsEndRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getLogType = (log) => {
        if (log.startsWith('[error]') || log.startsWith('[ERROR]')) return 'error';
        if (log.startsWith('[WARN]') || log.includes('warning:')) return 'warning';
        if (log.includes('✖')) return 'problem';
        if (log.includes('hmr update')) return 'hmr';
        return 'default';
    };

    const parseAnsiColor = (text) => {
        const cleanedText = text
            .replace(/\[0m/g, '\u001B[0m')
            .replace(/\[22m/g, '\u001B[22m')
            .replace(/\[39m/g, '\u001B[39m')
            .replace(/\[33m/g, '\u001B[33m')
            .replace(/\[36m/g, '\u001B[36m')
            .replace(/\[35m/g, '\u001B[35m')
            .replace(/\[32m/g, '\u001B[32m')
            .replace(/\[90m/g, '\u001B[90m');
        const ansiMap = {
            '30': 'ansi-black', '31': 'ansi-red', '32': 'ansi-green', '33': 'ansi-yellow',
            '34': 'ansi-blue', '35': 'ansi-magenta', '36': 'ansi-cyan', '37': 'ansi-white',
            '90': 'ansi-bright-black', '91': 'ansi-bright-red', '92': 'ansi-bright-green',
            '93': 'ansi-bright-yellow', '94': 'ansi-bright-blue', '95': 'ansi-bright-magenta',
            '96': 'ansi-bright-cyan', '97': 'ansi-bright-white',
            '40': 'ansi-bg-black', '41': 'ansi-bg-red', '42': 'ansi-bg-green', '43': 'ansi-bg-yellow',
            '44': 'ansi-bg-blue', '45': 'ansi-bg-magenta', '46': 'ansi-bg-cyan', '47': 'ansi-bg-white',
            '1': 'ansi-bold', '2': 'ansi-dim', '3': 'ansi-italic', '4': 'ansi-underline',
            '22': 'ansi-normal-weight', '39': 'ansi-default-color', '49': 'ansi-default-bg', '0': 'ansi-reset',
        };
        const regex = new RegExp(String.raw`(?:${String.fromCharCode(27)}|\[)([\d;]+)m`, 'g');
        const parts = cleanedText.split(regex);
        const result = [];
        let currentStyle = [];
        let spanKey = 0;

        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                if (parts[i] && !parts[i].match(/^\[\d+m$/)) {
                    result.push(
                        <span key={spanKey++} className={currentStyle.join(' ')}>
                            {parts[i]}
                        </span>
                    );
                }
            } else {
                const codes = parts[i].split(';');
                if (codes.includes('0')) {
                    currentStyle = [];
                } else {
                    codes.forEach((code) => {
                        if (ansiMap[code]) {
                            if (['1', '2', '22'].includes(code)) {
                                currentStyle = currentStyle.filter(s => !['ansi-bold', 'ansi-dim', 'ansi-normal-weight'].includes(s));
                            }
                            if (['30', '31', '32', '33', '34', '35', '36', '37', '90', '91', '92', '93', '94', '95', '96', '97', '39'].includes(code)) {
                                currentStyle = currentStyle.filter(s => !s.startsWith('ansi-') || (!s.startsWith('ansi-black') && !s.startsWith('ansi-bright-') && !s.startsWith('ansi-default-color')));
                            }
                            if (['40', '41', '42', '43', '44', '45', '46', '47', '49'].includes(code)) {
                                currentStyle = currentStyle.filter(s => !s.startsWith('ansi-bg-') && !s.startsWith('ansi-default-bg'));
                            }
                            currentStyle.push(ansiMap[code]);
                        }
                    });
                }
            }
        }
        return result.length === 0 ? cleanedText : result;
    };

    return (
        <div className="terminal-column">
            <div className="terminal-container">
                {logs.map((log, index) => (
                    <div key={index} className={`log-line ${getLogType(log)}`}>
                        {parseAnsiColor(log)}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};

export default TerminalPanel;