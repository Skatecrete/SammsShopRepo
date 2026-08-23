exports.handler = async (event, context) => {
    // Log what we're working with
    console.log('Environment variables available:', Object.keys(process.env).filter(k => k.includes('GITHUB')));
    
    let token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        console.log('⚠️ GITHUB_TOKEN not found in environment');
        // Hardcoded fallback for testing
        token = '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';
        console.log('⚠️ Using hardcoded fallback token');
    } else {
        console.log('✅ GITHUB_TOKEN found, length:', token.length);
    }
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ token: token })
    };
};
