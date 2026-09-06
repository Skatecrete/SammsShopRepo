exports.handler = async (event) => {
    const SHOP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWh3AsmhzASofyW3c0CEIEMD_2meFvTmIxA-vgFau2S8gn57bbeg2-8nGlw8NP6HzX5A/exec';
    
    try {
        let url = SHOP_SCRIPT_URL;
        let options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (event.httpMethod === 'POST') {
            options.method = 'POST';
            options.body = event.body;
        } else {
            // GET request - pass query parameters
            const params = new URLSearchParams(event.queryStringParameters);
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
