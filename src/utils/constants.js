export const HTTP_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD',
];

export const AUTH_TYPES = {
    NONE: 'none',
    BEARER: 'bearer',
    BASIC: 'basic',
    API_KEY: 'apikey',
};

export const BODY_TYPES = {
    JSON: 'json',
    FORM: 'form',
    RAW: 'raw',
};

export const CODE_LANGUAGES = [
    { value: 'curl', label: 'cURL' },
    { value: 'javascript', label: 'JavaScript (Fetch)' },
    { value: 'nodejs', label: 'Node.js (Axios)' },
    { value: 'python', label: 'Python (Requests)' },
    { value: 'php', label: 'PHP (cURL)' },
];
