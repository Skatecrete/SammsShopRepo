exports.handler = async (event) => {
    const SHOP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWh3AsmhzASofyW3c0CEIEMD_2meFvTmIxA-vgFau2S8gn57bbeg2-8nGlw8NP6HzX5A/exec';
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        let url = SHOP_SCRIPT_URL;
        let options = {
            headers: { 'Content-Type': 'application/json' },
            method: event.httpMethod
        };
        
        if (event.httpMethod === 'POST') {
            options.body = event.body;
        } else if (event.queryStringParameters) {
            const params = new URLSearchParams(event.queryStringParameters);
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
