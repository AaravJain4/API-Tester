import { useState } from 'react';

export const useAuth = () => {
    const [authType, setAuthType] = useState('none');
    const [bearerToken, setBearerToken] = useState('');
    const [basicUsername, setBasicUsername] = useState('');
    const [basicPassword, setBasicPassword] = useState('');
    const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
    const [apiKeyValue, setApiKeyValue] = useState('');

    const getAuthHeaders = (replaceEnvVars) => {
        const authHeaders = {};

        if (authType === 'bearer' && bearerToken) {
            authHeaders['Authorization'] = `Bearer ${replaceEnvVars(bearerToken)}`;
        } else if (authType === 'basic' && basicUsername && basicPassword) {
            const credentials = btoa(`${basicUsername}:${basicPassword}`);
            authHeaders['Authorization'] = `Basic ${credentials}`;
        } else if (authType === 'apikey' && apiKeyHeader && apiKeyValue) {
            authHeaders[apiKeyHeader] = replaceEnvVars(apiKeyValue);
        }

        return authHeaders;
    };

    const resetAuth = () => {
        setAuthType('none');
        setBearerToken('');
        setBasicUsername('');
        setBasicPassword('');
        setApiKeyHeader('X-API-Key');
        setApiKeyValue('');
    };

    const loadAuth = (auth) => {
        setAuthType(auth.authType || 'none');
        setBearerToken(auth.bearerToken || '');
        setBasicUsername(auth.basicUsername || '');
        setBasicPassword(auth.basicPassword || '');
        setApiKeyHeader(auth.apiKeyHeader || 'X-API-Key');
        setApiKeyValue(auth.apiKeyValue || '');
    };

    const getAuthData = () => ({
        authType,
        bearerToken,
        basicUsername,
        basicPassword,
        apiKeyHeader,
        apiKeyValue,
    });

    return {
        authType,
        setAuthType,
        bearerToken,
        setBearerToken,
        basicUsername,
        setBasicUsername,
        basicPassword,
        setBasicPassword,
        apiKeyHeader,
        setApiKeyHeader,
        apiKeyValue,
        setApiKeyValue,
        getAuthHeaders,
        resetAuth,
        loadAuth,
        getAuthData,
    };
};
