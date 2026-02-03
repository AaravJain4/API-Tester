export const generateCode = ({
    method,
    url,
    headers,
    body,
    bodyType,
    formParams,
    authHeaders,
    replaceEnvVars,
    language,
}) => {
    const allHeaders = { ...authHeaders };
    headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
            allHeaders[h.key] = replaceEnvVars(h.value);
        });

    const hasJSONBody =
        (bodyType === 'json' || bodyType === 'raw') &&
        ['POST', 'PUT', 'PATCH'].includes(method) &&
        body;
    const hasFormBody =
        bodyType === 'form' &&
        ['POST', 'PUT', 'PATCH'].includes(method) &&
        formParams.some((p) => p.enabled && p.key);

    const bodyContent = replaceEnvVars(body);
    const enabledFormParams = formParams.filter((p) => p.enabled && p.key);

    switch (language) {
        case 'curl':
            let curl = `curl -X ${method} "${url}"`;
            Object.entries(allHeaders).forEach(([key, value]) => {
                curl += ` \\\n  -H "${key}: ${value}"`;
            });
            if (hasJSONBody) {
                curl += ` \\\n  -d '${bodyContent}'`;
            } else if (hasFormBody) {
                enabledFormParams.forEach((p) => {
                    if (p.type === 'file') {
                        curl += ` \\\n  -F "${p.key}=@/path/to/file"`;
                    } else {
                        curl += ` \\\n  -F "${p.key}=${replaceEnvVars(p.value)}"`;
                    }
                });
            }
            return curl;

        case 'javascript':
            let jsCode = `fetch("${url}", {\n  method: "${method}"`;
            if (Object.keys(allHeaders).length > 0) {
                jsCode += `,\n  headers: ${JSON.stringify(allHeaders, null, 4)}`;
            }
            if (hasJSONBody) {
                jsCode += `,\n  body: ${bodyType === 'json' ? 'JSON.stringify(' + bodyContent + ')' : `"${bodyContent}"`}`;
            } else if (hasFormBody) {
                jsCode += `,\n  body: new FormData() // Add your fields here`;
            }
            jsCode += `\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;
            return jsCode;

        case 'python':
            let pyCode = `import requests\n\n`;
            pyCode += `url = "${url}"\n`;
            if (Object.keys(allHeaders).length > 0) {
                pyCode += `headers = ${JSON.stringify(allHeaders, null, 4).replace(/"/g, "'")}\\n`;
            }
            if (hasJSONBody) {
                pyCode += `data = ${bodyType === 'json' ? bodyContent : `"${bodyContent}"`}\n`;
            } else if (hasFormBody) {
                pyCode += `files = {\n`;
                enabledFormParams.forEach((p) => {
                    if (p.type === 'file') {
                        pyCode += `    '${p.key}': open('path/to/file', 'rb'),\n`;
                    } else {
                        pyCode += `    '${p.key}': (None, '${replaceEnvVars(p.value)}'),\n`;
                    }
                });
                pyCode += `}\n`;
            }
            pyCode += `\nresponse = requests.${method.toLowerCase()}(url`;
            if (Object.keys(allHeaders).length > 0) pyCode += `, headers=headers`;
            if (hasJSONBody)
                pyCode += bodyType === 'json' ? `, json=data` : `, data=data`;
            if (hasFormBody) pyCode += `, files=files`;
            pyCode += `)\nprint(response.json())`;
            return pyCode;

        case 'nodejs':
            let nodeCode = `const axios = require('axios');\n`;
            if (hasFormBody) nodeCode += `const FormData = require('form-data');\n`;
            nodeCode += `\naxios({\n  method: '${method.toLowerCase()}',\n  url: '${url}'`;
            if (Object.keys(allHeaders).length > 0) {
                nodeCode += `,\n  headers: ${JSON.stringify(allHeaders, null, 4)}`;
            }
            if (hasJSONBody) {
                nodeCode += `,\n  data: ${bodyType === 'json' ? bodyContent : `"${bodyContent}"`}`;
            } else if (hasFormBody) {
                nodeCode += `,\n  data: new FormData() // Use form-data library`;
            }
            nodeCode += `\n})\n  .then(response => console.log(response.data))\n  .catch(error => console.error('Error:', error));`;
            return nodeCode;

        case 'php':
            let phpCode = `<?php\n\n$url = "${url}";\n`;
            phpCode += `$ch = curl_init($url);\n\n`;
            phpCode += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
            phpCode += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
            if (Object.keys(allHeaders).length > 0) {
                phpCode += `\n$headers = [\n`;
                Object.entries(allHeaders).forEach(([key, value]) => {
                    phpCode += `    "${key}: ${value}",\n`;
                });
                phpCode += `];\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
            }
            if (hasJSONBody) {
                phpCode += `\n$data = '${bodyContent}';\n`;
                phpCode += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
            } else if (hasFormBody) {
                phpCode += `\n$postFields = [\n`;
                enabledFormParams.forEach((p) => {
                    if (p.type === 'file') {
                        phpCode += `    '${p.key}' => new CURLFile('path/to/file'),\n`;
                    } else {
                        phpCode += `    '${p.key}' => '${replaceEnvVars(p.value)}',\n`;
                    }
                });
                phpCode += `];\ncurl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);\n`;
            }
            phpCode += `\n$response = curl_exec($ch);\ncurl_close($ch);\n\necho $response;\n?>`;
            return phpCode;

        default:
            return 'Select a language';
    }
};
