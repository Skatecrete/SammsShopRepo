exports.handler = async (event) => {
    const SHOP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWh3AsmhzASofyW3c0CEIEMD_2meFvTmIxA-vgFau2S8gn57bbeg2-8nGlw8NP6HzX5A/exec';
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }
    
    try {
        console.log('📤 Proxying request:', event.httpMethod);
        console.log('📤 Path:', event.path);
        
        let url = SHOP_SCRIPT_URL;
        let options = {
            headers: {
                'Content-Type': 'application/json'
            },
            method: event.httpMethod
        };
        
        // Handle POST requests
        if (event.httpMethod === 'POST') {
            console.log('📤 POST body:', event.body);
            options.body = event.body;
        } 
        // Handle GET requests with query parameters
        else if (event.queryStringParameters) {
            const params = new URLSearchParams(event.queryStringParameters);
            const queryString = params.toString();
            if (queryString) {
                url += '?' + queryString;
            }
            console.log('📤 GET URL:', url);
        }
        
        console.log('📤 Fetching:', url);
        
        const response = await fetch(url, options);
        console.log('📤 Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📤 Response body (first 200 chars):', responseText.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Failed to parse JSON:', e.message);
            data = { error: 'Invalid JSON response from Google Sheets', raw: responseText };
        }
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('❌ Proxy error:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
};
