exports.handler = async () => {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GitHub token not configured' })
        };
    }
    
    // Test the token by making a request
    try {
        const testResponse = await fetch('https://api.github.com/repos/Skatecrete/SamsmShopRepo', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!testResponse.ok) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'Token validation failed', 
                    status: testResponse.status,
                    message: await testResponse.text()
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ token: token })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to validate token: ' + error.message })
        };
    }
};
