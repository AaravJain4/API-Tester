import { useState, useEffect } from 'react';

export const useCollections = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Load collections from localStorage
    useEffect(() => {
        const savedCollections = localStorage.getItem('apiCollections');
        if (savedCollections) {
            setCollections(JSON.parse(savedCollections));
        }
    }, []);

    // Save collections to localStorage
    const saveCollections = (newCollections) => {
        setCollections(newCollections);
        localStorage.setItem('apiCollections', JSON.stringify(newCollections));
    };

    const createCollection = (name) => {
        const newCollection = {
            id: Date.now().toString(),
            name,
            folders: [],
            requests: [],
            createdAt: new Date().toISOString(),
        };
        saveCollections([...collections, newCollection]);
        return newCollection;
    };

    const updateCollection = (collectionId, updates) => {
        const newCollections = collections.map((col) =>
            col.id === collectionId ? { ...col, ...updates } : col
        );
        saveCollections(newCollections);
    };

    const deleteCollection = (collectionId) => {
        const newCollections = collections.filter((col) => col.id !== collectionId);
        saveCollections(newCollections);
        if (selectedCollection?.id === collectionId) {
            setSelectedCollection(null);
            setSelectedFolder(null);
            setSelectedRequest(null);
        }
    };

    const createFolder = (collectionId, name) => {
        const newFolder = {
            id: Date.now().toString(),
            name,
            requests: [],
            createdAt: new Date().toISOString(),
        };

        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                return {
                    ...col,
                    folders: [...col.folders, newFolder],
                };
            }
            return col;
        });

        saveCollections(newCollections);
        return newFolder;
    };

    const updateFolder = (collectionId, folderId, updates) => {
        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                return {
                    ...col,
                    folders: col.folders.map((folder) =>
                        folder.id === folderId ? { ...folder, ...updates } : folder
                    ),
                };
            }
            return col;
        });
        saveCollections(newCollections);
    };

    const deleteFolder = (collectionId, folderId) => {
        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                return {
                    ...col,
                    folders: col.folders.filter((folder) => folder.id !== folderId),
                };
            }
            return col;
        });
        saveCollections(newCollections);
        if (selectedFolder?.id === folderId) {
            setSelectedFolder(null);
            setSelectedRequest(null);
        }
    };

    const saveRequest = (collectionId, folderId, requestData) => {
        const newRequest = {
            id: Date.now().toString(),
            ...requestData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                if (folderId) {
                    // Save to folder
                    return {
                        ...col,
                        folders: col.folders.map((folder) =>
                            folder.id === folderId
                                ? { ...folder, requests: [...folder.requests, newRequest] }
                                : folder
                        ),
                    };
                } else {
                    // Save to collection root
                    return {
                        ...col,
                        requests: [...col.requests, newRequest],
                    };
                }
            }
            return col;
        });

        saveCollections(newCollections);
        return newRequest;
    };

    const updateRequest = (collectionId, folderId, requestId, requestData) => {
        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                if (folderId) {
                    // Update in folder
                    return {
                        ...col,
                        folders: col.folders.map((folder) =>
                            folder.id === folderId
                                ? {
                                    ...folder,
                                    requests: folder.requests.map((req) =>
                                        req.id === requestId
                                            ? { ...req, ...requestData, updatedAt: new Date().toISOString() }
                                            : req
                                    ),
                                }
                                : folder
                        ),
                    };
                } else {
                    // Update in collection root
                    return {
                        ...col,
                        requests: col.requests.map((req) =>
                            req.id === requestId
                                ? { ...req, ...requestData, updatedAt: new Date().toISOString() }
                                : req
                        ),
                    };
                }
            }
            return col;
        });

        saveCollections(newCollections);
    };

    const deleteRequest = (collectionId, folderId, requestId) => {
        const newCollections = collections.map((col) => {
            if (col.id === collectionId) {
                if (folderId) {
                    // Delete from folder
                    return {
                        ...col,
                        folders: col.folders.map((folder) =>
                            folder.id === folderId
                                ? {
                                    ...folder,
                                    requests: folder.requests.filter((req) => req.id !== requestId),
                                }
                                : folder
                        ),
                    };
                } else {
                    // Delete from collection root
                    return {
                        ...col,
                        requests: col.requests.filter((req) => req.id !== requestId),
                    };
                }
            }
            return col;
        });

        saveCollections(newCollections);
        if (selectedRequest?.id === requestId) {
            setSelectedRequest(null);
        }
    };

    const duplicateRequest = (collectionId, folderId, requestId) => {
        let requestToDuplicate = null;

        collections.forEach((col) => {
            if (col.id === collectionId) {
                if (folderId) {
                    const folder = col.folders.find((f) => f.id === folderId);
                    requestToDuplicate = folder?.requests.find((r) => r.id === requestId);
                } else {
                    requestToDuplicate = col.requests.find((r) => r.id === requestId);
                }
            }
        });

        if (requestToDuplicate) {
            const duplicated = {
                ...requestToDuplicate,
                id: Date.now().toString(),
                name: `${requestToDuplicate.name} (Copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const newCollections = collections.map((col) => {
                if (col.id === collectionId) {
                    if (folderId) {
                        return {
                            ...col,
                            folders: col.folders.map((folder) =>
                                folder.id === folderId
                                    ? { ...folder, requests: [...folder.requests, duplicated] }
                                    : folder
                            ),
                        };
                    } else {
                        return {
                            ...col,
                            requests: [...col.requests, duplicated],
                        };
                    }
                }
                return col;
            });

            saveCollections(newCollections);
            return duplicated;
        }
    };

    const importCollection = (collectionData) => {
        const imported = {
            ...collectionData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        saveCollections([...collections, imported]);
        return imported;
    };

    const exportCollection = (collectionId) => {
        return collections.find((col) => col.id === collectionId);
    };

    return {
        collections,
        selectedCollection,
        setSelectedCollection,
        selectedFolder,
        setSelectedFolder,
        selectedRequest,
        setSelectedRequest,
        createCollection,
        updateCollection,
        deleteCollection,
        createFolder,
        updateFolder,
        deleteFolder,
        saveRequest,
        updateRequest,
        deleteRequest,
        duplicateRequest,
        importCollection,
        exportCollection,
    };
};
