exports.handler = async (event) => {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'GitHub token not configured in Netlify environment variables' })
        };
    }
    
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ token: token })
    };
};
