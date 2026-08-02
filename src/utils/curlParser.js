/**
 * Utility to parse cURL command strings and extract request details.
 */

export const isCurlCommand = (input) => {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();
    return /^(?:\$\s*)?curl(?:$|\s|\.exe)/i.test(trimmed);
};

export const parseCurl = (curlString) => {
    if (!isCurlCommand(curlString)) return null;

    // 1. Clean and normalize multiline continuations (\ at end of line or ^ in cmd)
    let clean = curlString
        .replace(/\\\r?\n/g, ' ')
        .replace(/\^\r?\n/g, ' ')
        .trim();

    // Remove leading '$ curl' or 'curl.exe' or 'curl'
    clean = clean.replace(/^(?:\$\s*)?curl(?:\.exe)?\s*/i, '');

    // 2. Tokenize command safely
    const tokens = [];
    let currentToken = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];

        if (escaped) {
            currentToken += char;
            escaped = false;
            continue;
        }

        if (char === '\\' && !inSingleQuote) {
            escaped = true;
            continue;
        }

        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
            if (currentToken.length > 0) {
                tokens.push(currentToken);
                currentToken = '';
            }
            continue;
        }

        currentToken += char;
    }

    if (currentToken.length > 0) {
        tokens.push(currentToken);
    }

    // 3. Parse tokens into request components
    let method = null;
    let url = '';
    const headers = [];
    const params = [];
    const formParams = [];
    const dataParts = [];
    let isJsonExplicit = false;
    let isFormExplicit = false;

    const auth = {
        authType: 'none',
        bearerToken: '',
        basicUsername: '',
        basicPassword: '',
        apiKeyHeader: 'X-API-Key',
        apiKeyValue: '',
    };

    const flagsWithValue = new Set([
        '-X', '--request',
        '-H', '--header',
        '-d', '--data', '--data-raw', '--data-binary', '--data-ascii', '--data-urlencode',
        '--json',
        '-F', '--form',
        '-u', '--user',
        '-A', '--user-agent',
        '-e', '--referer',
        '-b', '--cookie',
        '--url',
        '-m', '--max-time',
        '--connect-timeout',
        '--retry',
        '-o', '--output',
    ]);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token === '-X' || token === '--request') {
            if (i + 1 < tokens.length) {
                method = tokens[++i].toUpperCase();
            }
        } else if (token === '-H' || token === '--header') {
            if (i + 1 < tokens.length) {
                const headerStr = tokens[++i];
                const colIdx = headerStr.indexOf(':');
                if (colIdx !== -1) {
                    const key = headerStr.slice(0, colIdx).trim();
                    const val = headerStr.slice(colIdx + 1).trim();

                    // Check if Authorization header
                    if (key.toLowerCase() === 'authorization') {
                        if (val.toLowerCase().startsWith('bearer ')) {
                            auth.authType = 'bearer';
                            auth.bearerToken = val.slice(7).trim();
                        } else if (val.toLowerCase().startsWith('basic ')) {
                            auth.authType = 'basic';
                            try {
                                const decoded = atob(val.slice(6).trim());
                                const [u, p] = decoded.split(':');
                                auth.basicUsername = u || '';
                                auth.basicPassword = p || '';
                            } catch {
                                auth.basicUsername = val.slice(6).trim();
                            }
                        } else {
                            headers.push({ key, value: val, enabled: true });
                        }
                    } else {
                        headers.push({ key, value: val, enabled: true });
                    }
                }
            }
        } else if (token === '-A' || token === '--user-agent') {
            if (i + 1 < tokens.length) {
                headers.push({ key: 'User-Agent', value: tokens[++i], enabled: true });
            }
        } else if (token === '-e' || token === '--referer') {
            if (i + 1 < tokens.length) {
                headers.push({ key: 'Referer', value: tokens[++i], enabled: true });
            }
        } else if (token === '-b' || token === '--cookie') {
            if (i + 1 < tokens.length) {
                headers.push({ key: 'Cookie', value: tokens[++i], enabled: true });
            }
        } else if (token === '-u' || token === '--user') {
            if (i + 1 < tokens.length) {
                const userPass = tokens[++i];
                auth.authType = 'basic';
                const [u, p] = userPass.split(':');
                auth.basicUsername = u || '';
                auth.basicPassword = p || '';
            }
        } else if (
            token === '-d' ||
            token === '--data' ||
            token === '--data-raw' ||
            token === '--data-binary' ||
            token === '--data-ascii' ||
            token === '--data-urlencode'
        ) {
            if (i + 1 < tokens.length) {
                dataParts.push(tokens[++i]);
            }
        } else if (token === '--json') {
            if (i + 1 < tokens.length) {
                dataParts.push(tokens[++i]);
                isJsonExplicit = true;
            }
        } else if (token === '-F' || token === '--form') {
            if (i + 1 < tokens.length) {
                isFormExplicit = true;
                const formStr = tokens[++i];
                const eqIdx = formStr.indexOf('=');
                if (eqIdx !== -1) {
                    const key = formStr.slice(0, eqIdx).trim();
                    const val = formStr.slice(eqIdx + 1).trim();
                    if (val.startsWith('@')) {
                        formParams.push({ key, value: '', type: 'file', file: null, enabled: true });
                    } else {
                        formParams.push({ key, value: val.replace(/^["']|["']$/g, ''), type: 'text', file: null, enabled: true });
                    }
                } else {
                    formParams.push({ key: formStr, value: '', type: 'text', file: null, enabled: true });
                }
            }
        } else if (token === '--url') {
            if (i + 1 < tokens.length) {
                url = tokens[++i];
            }
        } else if (token.startsWith('-')) {
            // Check if flag takes an argument
            if (flagsWithValue.has(token)) {
                i++; // skip value
            }
        } else if (!url) {
            // Positional argument, assume it is the URL
            url = token;
        }
    }

    // Process URL and extract query params if present
    let baseUrl = url;
    if (url) {
        // Remove wrapping quotes if any remained
        url = url.replace(/^["']|["']$/g, '');
        try {
            const hasProtocol = /^[a-z]+:\/\//i.test(url);
            const parsedUrlObj = new URL(hasProtocol ? url : `http://${url}`);
            baseUrl = hasProtocol ? `${parsedUrlObj.origin}${parsedUrlObj.pathname}` : parsedUrlObj.pathname;
            parsedUrlObj.searchParams.forEach((value, key) => {
                params.push({ key, value, enabled: true });
            });
        } catch {
            // If URL parsing fails, extract ? manually
            const qIdx = url.indexOf('?');
            if (qIdx !== -1) {
                baseUrl = url.slice(0, qIdx);
                const search = url.slice(qIdx + 1);
                search.split('&').forEach((pair) => {
                    if (!pair) return;
                    const [k, v] = pair.split('=');
                    params.push({
                        key: decodeURIComponent(k || ''),
                        value: decodeURIComponent(v || ''),
                        enabled: true,
                    });
                });
            } else {
                baseUrl = url;
            }
        }
    }

    // Determine Body and Body Type
    let body = '';
    let bodyType = 'json';

    if (isFormExplicit || formParams.length > 0) {
        bodyType = 'form';
    } else if (dataParts.length > 0) {
        body = dataParts.join('&');
        const contentTypeHeader = headers.find(
            (h) => h.key.toLowerCase() === 'content-type'
        );
        const ctVal = contentTypeHeader ? contentTypeHeader.value.toLowerCase() : '';

        if (isJsonExplicit || ctVal.includes('application/json')) {
            bodyType = 'json';
        } else if (ctVal.includes('x-www-form-urlencoded')) {
            bodyType = 'raw';
        } else {
            try {
                JSON.parse(body);
                bodyType = 'json';
            } catch {
                bodyType = 'raw';
            }
        }
    }

    // Determine Method if not specified
    if (!method) {
        if (dataParts.length > 0 || formParams.length > 0 || isFormExplicit) {
            method = 'POST';
        } else {
            method = 'GET';
        }
    }

    // Format JSON body nicely if applicable
    if (bodyType === 'json' && body) {
        try {
            body = JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            // Keep body as is if formatting fails
        }
    }

    // Ensure default structure arrays have at least one empty entry if empty
    if (params.length === 0) {
        params.push({ key: '', value: '', enabled: true });
    }
    if (headers.length === 0) {
        headers.push({ key: '', value: '', enabled: true });
    }
    if (formParams.length === 0) {
        formParams.push({ key: '', value: '', type: 'text', file: null, enabled: true });
    }

    return {
        method,
        url: baseUrl,
        params,
        headers,
        body,
        bodyType,
        formParams,
        auth,
    };
};
