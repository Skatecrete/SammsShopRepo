exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'GitHub token not configured in Netlify environment variables' 
            })
        };
    }
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token: token })
    };
};
