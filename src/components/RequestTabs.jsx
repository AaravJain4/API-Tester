import { useState } from 'react';
import './RequestTabs.css';

const RequestTabs = ({
    activeTab,
    request,
    auth,
    preRequestScript,
    setPreRequestScript,
    testScript,
    setTestScript,
    codeLanguage,
    setCodeLanguage,
    generatedCode,
}) => {
    return (
        <div className="tab-content">
            {activeTab === 'params' && (
                <div className="key-value-section">
                    <div className="key-value-list">
                        {request.params.map((param, index) => (
                            <div key={index} className="key-value-row">
                                <input
                                    type="checkbox"
                                    checked={param.enabled}
                                    onChange={(e) =>
                                        request.updateParam(index, 'enabled', e.target.checked)
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Key"
                                    value={param.key}
                                    onChange={(e) =>
                                        request.updateParam(index, 'key', e.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={(e) =>
                                        request.updateParam(index, 'value', e.target.value)
                                    }
                                />
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => request.removeParam(index)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-secondary" onClick={request.addParam}>
                        + Add Parameter
                    </button>
                </div>
            )}

            {activeTab === 'authorization' && (
                <div className="auth-section">
                    <div className="auth-type-selector">
                        <label>Type:</label>
                        <select
                            className="select"
                            value={auth.authType}
                            onChange={(e) => auth.setAuthType(e.target.value)}
                        >
                            <option value="none">No Auth</option>
                            <option value="bearer">Bearer Token</option>
                            <option value="basic">Basic Auth</option>
                            <option value="apikey">API Key</option>
                        </select>
                    </div>

                    {auth.authType === 'bearer' && (
                        <div className="auth-config">
                            <label>Token:</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter bearer token"
                                value={auth.bearerToken}
                                onChange={(e) => auth.setBearerToken(e.target.value)}
                            />
                        </div>
                    )}

                    {auth.authType === 'basic' && (
                        <div className="auth-config">
                            <label>Username:</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Username"
                                value={auth.basicUsername}
                                onChange={(e) => auth.setBasicUsername(e.target.value)}
                            />
                            <label>Password:</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Password"
                                value={auth.basicPassword}
                                onChange={(e) => auth.setBasicPassword(e.target.value)}
                            />
                        </div>
                    )}

                    {auth.authType === 'apikey' && (
                        <div className="auth-config">
                            <label>Header Name:</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., X-API-Key"
                                value={auth.apiKeyHeader}
                                onChange={(e) => auth.setApiKeyHeader(e.target.value)}
                            />
                            <label>Value:</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="API key value"
                                value={auth.apiKeyValue}
                                onChange={(e) => auth.setApiKeyValue(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'headers' && (
                <div className="key-value-section">
                    <div className="key-value-list">
                        {request.headers.map((header, index) => (
                            <div key={index} className="key-value-row">
                                <input
                                    type="checkbox"
                                    checked={header.enabled}
                                    onChange={(e) =>
                                        request.updateHeader(index, 'enabled', e.target.checked)
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Key"
                                    value={header.key}
                                    onChange={(e) =>
                                        request.updateHeader(index, 'key', e.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Value"
                                    value={header.value}
                                    onChange={(e) =>
                                        request.updateHeader(index, 'value', e.target.value)
                                    }
                                />
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => request.removeHeader(index)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-secondary" onClick={request.addHeader}>
                        + Add Header
                    </button>
                </div>
            )}

            {activeTab === 'body' && (
                <div className="body-section">
                    <div className="body-type-selector">
                        <label>
                            <input
                                type="radio"
                                value="json"
                                checked={request.bodyType === 'json'}
                                onChange={(e) => request.setBodyType(e.target.value)}
                            />
                            JSON
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="form"
                                checked={request.bodyType === 'form'}
                                onChange={(e) => request.setBodyType(e.target.value)}
                            />
                            Form Data
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="raw"
                                checked={request.bodyType === 'raw'}
                                onChange={(e) => request.setBodyType(e.target.value)}
                            />
                            Raw
                        </label>
                    </div>

                    {(request.bodyType === 'json' || request.bodyType === 'raw') && (
                        <textarea
                            className="textarea code-editor"
                            placeholder={request.bodyType === 'json' ? 'Enter JSON body' : 'Enter raw body'}
                            value={request.body}
                            onChange={(e) => request.setBody(e.target.value)}
                            rows={12}
                        />
                    )}

                    {request.bodyType === 'form' && (
                        <div className="key-value-section">
                            <div className="key-value-list">
                                {request.formParams.map((param, index) => (
                                    <div key={index} className="key-value-row form-row">
                                        <input
                                            type="checkbox"
                                            checked={param.enabled}
                                            onChange={(e) =>
                                                request.updateFormParam(index, 'enabled', e.target.checked)
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Key"
                                            value={param.key}
                                            onChange={(e) =>
                                                request.updateFormParam(index, 'key', e.target.value)
                                            }
                                        />
                                        <select
                                            className="select"
                                            value={param.type}
                                            onChange={(e) =>
                                                request.updateFormParam(index, 'type', e.target.value)
                                            }
                                        >
                                            <option value="text">Text</option>
                                            <option value="file">File</option>
                                        </select>
                                        {param.type === 'text' ? (
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Value"
                                                value={param.value}
                                                onChange={(e) =>
                                                    request.updateFormParam(index, 'value', e.target.value)
                                                }
                                            />
                                        ) : (
                                            <input
                                                type="file"
                                                className="input"
                                                onChange={(e) =>
                                                    request.updateFormParam(index, 'file', e.target.files[0])
                                                }
                                            />
                                        )}
                                        <button
                                            className="btn btn-icon btn-secondary"
                                            onClick={() => request.removeFormParam(index)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-secondary" onClick={request.addFormParam}>
                                + Add Field
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'tests' && (
                <div className="tests-section">
                    <div className="script-editor">
                        <h4>Pre-request Script</h4>
                        <p className="script-description">
                            JavaScript code to run before the request
                        </p>
                        <textarea
                            className="textarea code-editor"
                            placeholder="// Run before request&#10;console.log('Pre-request script');"
                            value={preRequestScript}
                            onChange={(e) => setPreRequestScript(e.target.value)}
                            rows={6}
                        />
                    </div>

                    <div className="script-editor">
                        <h4>Tests</h4>
                        <p className="script-description">
                            Write tests using expect() assertions
                        </p>
                        <textarea
                            className="textarea code-editor"
                            placeholder="// Example:&#10;expect(response.status).toBe(200);&#10;expect(response.body).toContain('success');"
                            value={testScript}
                            onChange={(e) => setTestScript(e.target.value)}
                            rows={6}
                        />
                    </div>

                    <div className="test-examples">
                        <h5>Available Assertions:</h5>
                        <ul>
                            <li><code>expect(value).toBe(expected)</code> - Strict equality</li>
                            <li><code>expect(value).toEqual(expected)</code> - Deep equality</li>
                            <li><code>expect(value).toContain(substring)</code> - Contains check</li>
                            <li><code>expect(value).toBeLessThan(number)</code> - Less than</li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'code' && (
                <div className="code-section">
                    <div className="code-header">
                        <h4>Code Generation</h4>
                        <select
                            className="select"
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                        >
                            <option value="curl">cURL</option>
                            <option value="javascript">JavaScript (Fetch)</option>
                            <option value="nodejs">Node.js (Axios)</option>
                            <option value="python">Python (Requests)</option>
                            <option value="php">PHP (cURL)</option>
                        </select>
                    </div>
                    <pre className="code-block">
                        <code>{generatedCode}</code>
                    </pre>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            navigator.clipboard.writeText(generatedCode);
                            alert('Code copied to clipboard!');
                        }}
                    >
                        📋 Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequestTabs;
