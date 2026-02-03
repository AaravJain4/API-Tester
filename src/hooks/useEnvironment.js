import { useState, useEffect } from 'react';

export const useEnvironment = () => {
    const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        const savedEnvVars = localStorage.getItem('envVars');
        if (savedEnvVars) {
            setEnvVars(JSON.parse(savedEnvVars));
        }
    }, []);

    const addEnvVar = () => {
        setEnvVars([...envVars, { key: '', value: '' }]);
    };

    const updateEnvVar = (index, field, value) => {
        const newEnvVars = [...envVars];
        newEnvVars[index][field] = value;
        setEnvVars(newEnvVars);
        localStorage.setItem('envVars', JSON.stringify(newEnvVars));
    };

    const removeEnvVar = (index) => {
        const newEnvVars = envVars.filter((_, i) => i !== index);
        setEnvVars(newEnvVars);
        localStorage.setItem('envVars', JSON.stringify(newEnvVars));
    };

    const replaceEnvVars = (text) => {
        let result = text;
        envVars.forEach(({ key, value }) => {
            if (key && value) {
                result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
        });
        return result;
    };

    return {
        envVars,
        addEnvVar,
        updateEnvVar,
        removeEnvVar,
        replaceEnvVars,
    };
};
