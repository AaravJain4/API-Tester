export const buildUrl = (url, params, replaceEnvVars) => {
    let finalUrl = replaceEnvVars(url);
    const enabledParams = params.filter((p) => p.enabled && p.key);

    if (enabledParams.length > 0) {
        const queryString = enabledParams
            .map(
                (p) =>
                    `${encodeURIComponent(p.key)}=${encodeURIComponent(replaceEnvVars(p.value))}`
            )
            .join('&');
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
    }

    return finalUrl;
};

export const formatJSON = (data) => {
    try {
        if (typeof data === 'string') {
            return JSON.stringify(JSON.parse(data), null, 2);
        }
        return JSON.stringify(data, null, 2);
    } catch {
        return data;
    }
};

export const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 300 && status < 400) return 'status-3xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    if (status >= 500) return 'status-5xx';
    return '';
};

export const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const uploadJSON = () => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = reject;
                reader.readAsText(file);
            }
        };
        input.click();
    });
};
