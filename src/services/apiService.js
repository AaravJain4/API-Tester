export const sendApiRequest = async ({
    method,
    url,
    headers,
    body,
    bodyType,
    formParams,
    authHeaders,
    replaceEnvVars,
}) => {
    const requestHeaders = { ...authHeaders };
    headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
            requestHeaders[h.key] = replaceEnvVars(h.value);
        });

    const options = {
        method,
        headers: requestHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json') {
            options.headers['Content-Type'] = 'application/json';
            options.body = replaceEnvVars(body);
        } else if (bodyType === 'form') {
            const hasFile = formParams.some(
                (p) => p.enabled && p.type === 'file' && p.file
            );

            if (hasFile) {
                const formData = new FormData();
                formParams
                    .filter((p) => p.enabled && p.key)
                    .forEach((p) => {
                        if (p.type === 'file' && p.file) {
                            formData.append(p.key, p.file);
                        } else {
                            formData.append(p.key, replaceEnvVars(p.value));
                        }
                    });
                options.body = formData;
                delete options.headers['Content-Type'];
            } else {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                const params = new URLSearchParams();
                formParams
                    .filter((p) => p.enabled && p.key)
                    .forEach((p) => {
                        params.append(p.key, replaceEnvVars(p.value));
                    });
                options.body = params.toString();
            }
        } else {
            options.body = replaceEnvVars(body);
        }
    }

    const startTime = performance.now();
    const res = await fetch(url, options);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    let responseBody;
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');

    if (contentType && contentType.includes('application/json')) {
        responseBody = await res.json();
    } else {
        responseBody = await res.text();
    }

    const responseHeaders = {};
    res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    return {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
        size: contentLength || new Blob([JSON.stringify(responseBody)]).size,
        timestamp: new Date().toISOString(),
    };
};

export const runTests = (response, testScript) => {
    if (!testScript.trim()) return [];

    const results = [];
    const testContext = {
        response: {
            status: response.status,
            headers: response.headers,
            body: response.body,
            duration: response.duration,
        },
        expect: (actual) => ({
            toBe: (expected) => {
                const passed = actual === expected;
                results.push({
                    passed,
                    message: passed
                        ? `✓ Expected ${actual} to be ${expected}`
                        : `✗ Expected ${actual} to be ${expected}`,
                });
            },
            toEqual: (expected) => {
                const passed = JSON.stringify(actual) === JSON.stringify(expected);
                results.push({
                    passed,
                    message: passed ? `✓ Values are equal` : `✗ Values are not equal`,
                });
            },
            toContain: (expected) => {
                const passed = JSON.stringify(actual).includes(expected);
                results.push({
                    passed,
                    message: passed
                        ? `✓ Contains ${expected}`
                        : `✗ Does not contain ${expected}`,
                });
            },
            toBeLessThan: (expected) => {
                const passed = actual < expected;
                results.push({
                    passed,
                    message: passed
                        ? `✓ ${actual} < ${expected}`
                        : `✗ ${actual} >= ${expected}`,
                });
            },
        }),
    };

    try {
        const testFunction = new Function('response', 'expect', testScript);
        testFunction(testContext.response, testContext.expect);
    } catch (error) {
        results.push({
            passed: false,
            message: `✗ Test error: ${error.message}`,
        });
    }

    return results;
};
