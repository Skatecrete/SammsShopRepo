exports.handler = async () => {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GitHub token not configured in environment variables' })
        };
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({ token: token })
    };
};
