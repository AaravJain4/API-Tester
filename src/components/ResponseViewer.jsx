import { useState } from 'react';
import { formatJSON, formatBytes, getStatusClass } from '../utils/helpers';
import './ResponseViewer.css';

const ResponseViewer = ({ response, testResults }) => {
    const [responseTab, setResponseTab] = useState('pretty');

    if (!response) {
        return (
            <div className="response-section card">
                <div className="response-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <h3>No Response Yet</h3>
                    <p>Send a request to see the response here</p>
                </div>
            </div>
        );
    }

    if (response.error) {
        return (
            <div className="response-section card">
                <div className="response-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <h3>Request Failed</h3>
                    <p>{response.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="response-section card">
            <div className="response-header">
                <div className="response-meta">
                    <span className={`status-badge ${getStatusClass(response.status)}`}>
                        {response.status} {response.statusText}
                    </span>
                    <span className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {response.duration}ms
                    </span>
                    <span className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {formatBytes(response.size)}
                    </span>
                </div>
            </div>

            <div className="response-tabs">
                <button
                    className={`tab ${responseTab === 'pretty' ? 'active' : ''}`}
                    onClick={() => setResponseTab('pretty')}
                >
                    Pretty
                </button>
                <button
                    className={`tab ${responseTab === 'raw' ? 'active' : ''}`}
                    onClick={() => setResponseTab('raw')}
                >
                    Raw
                </button>
                <button
                    className={`tab ${responseTab === 'headers' ? 'active' : ''}`}
                    onClick={() => setResponseTab('headers')}
                >
                    Headers
                </button>
                {testResults.length > 0 && (
                    <button
                        className={`tab ${responseTab === 'tests' ? 'active' : ''}`}
                        onClick={() => setResponseTab('tests')}
                    >
                        Tests ({testResults.filter(t => t.passed).length}/{testResults.length})
                    </button>
                )}
            </div>

            <div className="response-content">
                {responseTab === 'pretty' && (
                    <pre className="response-body">
                        <code>{formatJSON(response.body)}</code>
                    </pre>
                )}

                {responseTab === 'raw' && (
                    <pre className="response-body">
                        <code>{typeof response.body === 'string' ? response.body : JSON.stringify(response.body)}</code>
                    </pre>
                )}

                {responseTab === 'headers' && (
                    <div className="response-headers">
                        {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="header-row">
                                <span className="header-key">{key}:</span>
                                <span className="header-value">{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {responseTab === 'tests' && (
                    <div className="test-results">
                        {testResults.map((result, index) => (
                            <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                                {result.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponseViewer;
