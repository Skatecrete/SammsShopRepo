exports.handler = async (event, context) => {
    // HARDCODED TOKEN - WORKS IMMEDIATELY
    const token = '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';
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ token: token })
    };
};
