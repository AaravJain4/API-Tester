import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RequestTabs from './components/RequestTabs';
import ResponseViewer from './components/ResponseViewer';
import { useRequest } from './hooks/useRequest';
import { useAuth } from './hooks/useAuth';
import { useCollections } from './hooks/useCollections';
import { useEnvironment } from './hooks/useEnvironment';
import { useHistory } from './hooks/useHistory';
import { HTTP_METHODS } from './utils/constants';
import { buildUrl, getStatusClass } from './utils/helpers';
import { sendApiRequest, runTests } from './services/apiService';
import { generateCode } from './utils/codeGenerator';

function App() {
  // UI State
  const [activeTab, setActiveTab] = useState('params');
  const [codeLanguage, setCodeLanguage] = useState('curl');
  const [showEnv, setShowEnv] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [requestName, setRequestName] = useState('');

  // Request State
  const request = useRequest();
  const auth = useAuth();
  const collections = useCollections();
  const environment = useEnvironment();
  const history = useHistory();

  // Response State
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Scripts State
  const [preRequestScript, setPreRequestScript] = useState('');
  const [testScript, setTestScript] = useState('');

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setTestResults([]);

    const finalUrl = buildUrl(request.url, request.params, environment.replaceEnvVars);

    try {
      // Run pre-request script
      if (preRequestScript.trim()) {
        try {
          const preRequestFunction = new Function(preRequestScript);
          preRequestFunction();
        } catch (error) {
          console.error('Pre-request script error:', error);
        }
      }

      const authHeaders = auth.getAuthHeaders(environment.replaceEnvVars);

      const responseData = await sendApiRequest({
        method: request.method,
        url: finalUrl,
        headers: request.headers,
        body: request.body,
        bodyType: request.bodyType,
        formParams: request.formParams,
        authHeaders,
        replaceEnvVars: environment.replaceEnvVars,
      });

      setResponse(responseData);

      // Run tests
      const results = runTests(responseData, testScript);
      setTestResults(results);

      // Add to history
      const historyItem = {
        method: request.method,
        url: finalUrl,
        timestamp: new Date().toISOString(),
        status: responseData.status,
        duration: responseData.duration,
      };

      history.addToHistory(historyItem);
    } catch (error) {
      setResponse({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequest = () => {
    if (!collections.selectedCollection) {
      alert('Please select a collection first');
      return;
    }

    const requestData = {
      name: requestName || 'Untitled Request',
      ...request.getRequestData(),
      ...auth.getAuthData(),
      preRequestScript,
      testScript,
    };

    if (collections.selectedRequest) {
      // Update existing request
      collections.updateRequest(
        collections.selectedCollection.id,
        collections.selectedFolder?.id,
        collections.selectedRequest.id,
        requestData
      );
    } else {
      // Save new request
      collections.saveRequest(
        collections.selectedCollection.id,
        collections.selectedFolder?.id,
        requestData
      );
    }

    setShowSaveModal(false);
    setRequestName('');
  };

  const handleLoadRequest = (savedRequest) => {
    request.loadRequest(savedRequest);
    auth.loadAuth(savedRequest);
    setPreRequestScript(savedRequest.preRequestScript || '');
    setTestScript(savedRequest.testScript || '');
    setRequestName(savedRequest.name || '');
  };

  const handleNewRequest = () => {
    request.resetRequest();
    auth.resetAuth();
    setPreRequestScript('');
    setTestScript('');
    setRequestName('');
    collections.setSelectedRequest(null);
    setResponse(null);
    setTestResults([]);
  };

  const loadFromHistory = (item) => {
    request.setMethod(item.method);
    request.setUrl(item.url);
    setShowHistory(false);
  };

  const generatedCode = generateCode({
    method: request.method,
    url: buildUrl(request.url, request.params, environment.replaceEnvVars),
    headers: request.headers,
    body: request.body,
    bodyType: request.bodyType,
    formParams: request.formParams,
    authHeaders: auth.getAuthHeaders(environment.replaceEnvVars),
    replaceEnvVars: environment.replaceEnvVars,
    language: codeLanguage,
  });

  return (
    <div className="app">
      <Header
        showEnv={showEnv}
        setShowEnv={setShowEnv}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      <div className="app-layout">
        {showSidebar && (
          <Sidebar
            collections={collections.collections}
            selectedCollection={collections.selectedCollection}
            setSelectedCollection={collections.setSelectedCollection}
            selectedFolder={collections.selectedFolder}
            setSelectedFolder={collections.setSelectedFolder}
            selectedRequest={collections.selectedRequest}
            setSelectedRequest={collections.setSelectedRequest}
            createCollection={collections.createCollection}
            createFolder={collections.createFolder}
            deleteCollection={collections.deleteCollection}
            deleteFolder={collections.deleteFolder}
            deleteRequest={collections.deleteRequest}
            duplicateRequest={collections.duplicateRequest}
            onLoadRequest={handleLoadRequest}
            onNewRequest={handleNewRequest}
            importCollection={collections.importCollection}
            exportCollection={collections.exportCollection}
          />
        )}

        <main className="main-content">
          <div className="container">
            {showEnv && (
              <div className="card env-panel animate-slide-in">
                <div className="panel-header">
                  <h3>Environment Variables</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowEnv(false)}
                  >
                    Close
                  </button>
                </div>
                <p className="env-description">
                  Use variables in your requests with {`{{variableName}}`} syntax
                </p>
                <div className="key-value-list">
                  {environment.envVars.map((env, index) => (
                    <div key={index} className="key-value-row">
                      <input
                        type="text"
                        className="input"
                        placeholder="Variable name"
                        value={env.key}
                        onChange={(e) =>
                          environment.updateEnvVar(index, 'key', e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="Value"
                        value={env.value}
                        onChange={(e) =>
                          environment.updateEnvVar(index, 'value', e.target.value)
                        }
                      />
                      <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => environment.removeEnvVar(index)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={environment.addEnvVar}>
                  + Add Variable
                </button>
              </div>
            )}

            {showHistory && (
              <div className="card history-panel animate-slide-in">
                <div className="panel-header">
                  <h3>Request History</h3>
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={history.clearHistory}
                    >
                      Clear All
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowHistory(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="history-list">
                  {history.history.length === 0 ? (
                    <p className="empty-state">No requests yet</p>
                  ) : (
                    history.history.map((item, index) => (
                      <div
                        key={index}
                        className="history-item"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="history-item-header">
                          <span
                            className={`method-badge method-${item.method.toLowerCase()}`}
                          >
                            {item.method}
                          </span>
                          <span
                            className={`status-badge ${getStatusClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="history-item-url">{item.url}</div>
                        <div className="history-item-meta">
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                          <span>{item.duration}ms</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="request-section card">
              <div className="request-header-bar">
                <button
                  className="btn btn-icon btn-secondary"
                  onClick={() => setShowSidebar(!showSidebar)}
                  title="Toggle Sidebar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                <div className="request-title">
                  {collections.selectedRequest ? (
                    <span>{collections.selectedRequest.name}</span>
                  ) : (
                    <span>New Request</span>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowSaveModal(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save
                </button>
              </div>

              <div className="request-url-bar">
                <select
                  className="select method-select"
                  value={request.method}
                  onChange={(e) => request.setMethod(e.target.value)}
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="input url-input"
                  placeholder="Enter request URL (use {{varName}} for variables)"
                  value={request.url}
                  onChange={(e) => request.setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                />
                <button
                  className="btn btn-primary send-btn"
                  onClick={sendRequest}
                  disabled={!request.url || loading}
                >
                  {loading ? (
                    <>
                      <span className="loading">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>

              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'params' ? 'active' : ''}`}
                  onClick={() => setActiveTab('params')}
                >
                  Query Params
                </button>
                <button
                  className={`tab ${activeTab === 'authorization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('authorization')}
                >
                  🔐 Authorization
                </button>
                <button
                  className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('headers')}
                >
                  Headers
                </button>
                {['POST', 'PUT', 'PATCH'].includes(request.method) && (
                  <button
                    className={`tab ${activeTab === 'body' ? 'active' : ''}`}
                    onClick={() => setActiveTab('body')}
                  >
                    Body
                  </button>
                )}
                <button
                  className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tests')}
                >
                  ⚡ Tests
                </button>
                <button
                  className={`tab ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  💻 Code
                </button>
              </div>

              <RequestTabs
                activeTab={activeTab}
                request={request}
                auth={auth}
                preRequestScript={preRequestScript}
                setPreRequestScript={setPreRequestScript}
                testScript={testScript}
                setTestScript={setTestScript}
                codeLanguage={codeLanguage}
                setCodeLanguage={setCodeLanguage}
                generatedCode={generatedCode}
              />
            </div>

            <ResponseViewer response={response} testResults={testResults} />
          </div>
        </main>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save Request</h3>
            <input
              type="text"
              className="input"
              placeholder="Request name"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveRequest()}
              autoFocus
            />
            {!collections.selectedCollection && (
              <p className="text-warning" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Please select a collection from the sidebar first
              </p>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRequest}
                disabled={!collections.selectedCollection}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
