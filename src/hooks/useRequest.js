import { useState } from 'react';

export const useRequest = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [params, setParams] = useState([{ key: '', value: '', enabled: true }]);
  const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('json');
  const [formParams, setFormParams] = useState([
    { key: '', value: '', type: 'text', file: null, enabled: true },
  ]);

  const addParam = () => {
    setParams([...params, { key: '', value: '', enabled: true }]);
  };

  const updateParam = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const removeParam = (index) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addFormParam = () => {
    setFormParams([
      ...formParams,
      { key: '', value: '', type: 'text', file: null, enabled: true },
    ]);
  };

  const updateFormParam = (index, field, value) => {
    const newFormParams = [...formParams];
    newFormParams[index][field] = value;
    setFormParams(newFormParams);
  };

  const removeFormParam = (index) => {
    setFormParams(formParams.filter((_, i) => i !== index));
  };

  const resetRequest = () => {
    setMethod('GET');
    setUrl('');
    setParams([{ key: '', value: '', enabled: true }]);
    setHeaders([{ key: '', value: '', enabled: true }]);
    setBody('');
    setBodyType('json');
    setFormParams([{ key: '', value: '', type: 'text', file: null, enabled: true }]);
  };

  const loadRequest = (request) => {
    setMethod(request.method || 'GET');
    setUrl(request.url || '');
    setParams(request.params || [{ key: '', value: '', enabled: true }]);
    setHeaders(request.headers || [{ key: '', value: '', enabled: true }]);
    setBody(request.body || '');
    setBodyType(request.bodyType || 'json');
    setFormParams(request.formParams || [{ key: '', value: '', type: 'text', file: null, enabled: true }]);
  };

  const getRequestData = () => ({
    method,
    url,
    params,
    headers,
    body,
    bodyType,
    formParams,
  });

  return {
    method,
    setMethod,
    url,
    setUrl,
    params,
    setParams,
    headers,
    setHeaders,
    body,
    setBody,
    bodyType,
    setBodyType,
    formParams,
    setFormParams,
    addParam,
    updateParam,
    removeParam,
    addHeader,
    updateHeader,
    removeHeader,
    addFormParam,
    updateFormParam,
    removeFormParam,
    resetRequest,
    loadRequest,
    getRequestData,
  };
};
