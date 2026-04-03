import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({
    collections,
    selectedCollection,
    setSelectedCollection,
    selectedFolder,
    setSelectedFolder,
    selectedRequest,
    setSelectedRequest,
    createCollection,
    createFolder,
    deleteCollection,
    deleteFolder,
    deleteRequest,
    duplicateRequest,
    onLoadRequest,
    onNewRequest,
    importCollection,
    exportCollection,
}) => {
    const [expandedCollections, setExpandedCollections] = useState(new Set());
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [contextMenu, setContextMenu] = useState(null);

    const toggleCollection = (collectionId) => {
        const newExpanded = new Set(expandedCollections);
        if (newExpanded.has(collectionId)) {
            newExpanded.delete(collectionId);
        } else {
            newExpanded.add(collectionId);
        }
        setExpandedCollections(newExpanded);
    };

    const toggleFolder = (folderId) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleCreateCollection = () => {
        if (newCollectionName.trim()) {
            createCollection(newCollectionName.trim());
            setNewCollectionName('');
            setShowNewCollectionModal(false);
        }
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim() && selectedCollection) {
            createFolder(selectedCollection.id, newFolderName.trim());
            setNewFolderName('');
            setShowNewFolderModal(false);
        }
    };

    const handleRequestClick = (collection, folder, request) => {
        setSelectedCollection(collection);
        setSelectedFolder(folder);
        setSelectedRequest(request);
        onLoadRequest(request);
    };

    const handleContextMenu = (e, type, data) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            data,
        });
    };

    const handleImport = async () => {
        try {
            const { uploadJSON } = await import('../utils/helpers');
            const data = await uploadJSON();
            importCollection(data);
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const handleExport = (collectionId) => {
        const { downloadJSON } = require('../utils/helpers');
        const collection = exportCollection(collectionId);
        if (collection) {
            downloadJSON(collection, `${collection.name}.json`);
        }
    };

    const closeContextMenu = () => setContextMenu(null);

    return (
        <>
            <div className="sidebar" onClick={closeContextMenu}>
                <div className="sidebar-top-actions">
                    <button className="btn btn-primary btn-block new-request-btn" onClick={onNewRequest}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Request
                    </button>
                </div>
                <div className="sidebar-header">
                    <div className="sidebar-header-top">
                        <h2>Collections</h2>
                        <div className="sidebar-actions">
                            <button
                                className="btn btn-primary btn-icon"
                                onClick={() => setShowNewCollectionModal(true)}
                                title="New Collection"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    <line x1="12" y1="11" x2="12" y2="17" />
                                    <line x1="9" y1="14" x2="15" y2="14" />
                                </svg>
                            </button>
                            <button
                                className="btn btn-primary btn-icon"
                                onClick={handleImport}
                                title="Import Collection"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                

                <div className="collections-list">
                    {collections.length === 0 ? (
                        <div className="empty-state">
                            <p>No collections yet</p>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setShowNewCollectionModal(true)}
                            >
                                Create Collection
                            </button>
                        </div>
                    ) : (
                        collections.map((collection) => (
                            <div key={collection.id} className="collection-item">
                                <div
                                    className="collection-header"
                                    onClick={() => toggleCollection(collection.id)}
                                    onContextMenu={(e) => handleContextMenu(e, 'collection', collection)}
                                >
                                    <svg
                                        className={`expand-icon ${expandedCollections.has(collection.id) ? 'expanded' : ''}`}
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="collection-name">{collection.name}</span>
                                    <button
                                        className="btn btn-primary btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCollection(collection);
                                            setShowNewFolderModal(true);
                                        }}
                                        title="Add Folder"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                            <line x1="12" y1="11" x2="12" y2="17" />
                                            <line x1="9" y1="14" x2="15" y2="14" />
                                        </svg>
                                    </button>
                                </div>

                                {expandedCollections.has(collection.id) && (
                                    <div className="collection-content">
                                        {/* Folders */}
                                        {collection.folders.map((folder) => (
                                            <div key={folder.id} className="folder-item">
                                                <div
                                                    className="folder-header"
                                                    onClick={() => toggleFolder(folder.id)}
                                                    onContextMenu={(e) => handleContextMenu(e, 'folder', { collection, folder })}
                                                >
                                                    <svg
                                                        className={`expand-icon ${expandedFolders.has(folder.id) ? 'expanded' : ''}`}
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="9 18 15 12 9 6" />
                                                    </svg>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    <span className="folder-name">{folder.name}</span>
                                                </div>

                                                {expandedFolders.has(folder.id) && (
                                                    <div className="folder-content">
                                                        {folder.requests.map((request) => (
                                                            <div
                                                                key={request.id}
                                                                className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                                                                onClick={() => handleRequestClick(collection, folder, request)}
                                                                onContextMenu={(e) => handleContextMenu(e, 'request', { collection, folder, request })}
                                                            >
                                                                <span className={`method-badge method-${request.method?.toLowerCase()}`}>
                                                                    {request.method}
                                                                </span>
                                                                <span className="request-name">{request.name || 'Untitled'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Root-level requests */}
                                        {collection.requests.map((request) => (
                                            <div
                                                key={request.id}
                                                className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                                                onClick={() => handleRequestClick(collection, null, request)}
                                                onContextMenu={(e) => handleContextMenu(e, 'request', { collection, folder: null, request })}
                                            >
                                                <span className={`method-badge method-${request.method?.toLowerCase()}`}>
                                                    {request.method}
                                                </span>
                                                <span className="request-name">{request.name || 'Untitled'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* New Collection Modal */}
            {showNewCollectionModal && (
                <div className="modal-overlay" onClick={() => setShowNewCollectionModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>New Collection</h3>
                        <input
                            type="text"
                            className="input"
                            placeholder="Collection name"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewCollectionModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateCollection}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>New Folder</h3>
                        <input
                            type="text"
                            className="input"
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewFolderModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateFolder}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={closeContextMenu}
                >
                    {contextMenu.type === 'collection' && (
                        <>
                            <div
                                className="context-menu-item"
                                onClick={() => handleExport(contextMenu.data.id)}
                            >
                                Export
                            </div>
                            <div
                                className="context-menu-item danger"
                                onClick={() => deleteCollection(contextMenu.data.id)}
                            >
                                Delete
                            </div>
                        </>
                    )}
                    {contextMenu.type === 'folder' && (
                        <div
                            className="context-menu-item danger"
                            onClick={() => deleteFolder(contextMenu.data.collection.id, contextMenu.data.folder.id)}
                        >
                            Delete
                        </div>
                    )}
                    {contextMenu.type === 'request' && (
                        <>
                            <div
                                className="context-menu-item"
                                onClick={() => duplicateRequest(
                                    contextMenu.data.collection.id,
                                    contextMenu.data.folder?.id,
                                    contextMenu.data.request.id
                                )}
                            >
                                Duplicate
                            </div>
                            <div
                                className="context-menu-item danger"
                                onClick={() => deleteRequest(
                                    contextMenu.data.collection.id,
                                    contextMenu.data.folder?.id,
                                    contextMenu.data.request.id
                                )}
                            >
                                Delete
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default Sidebar;
