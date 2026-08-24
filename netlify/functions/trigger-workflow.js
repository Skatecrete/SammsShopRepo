exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        // Get token from environment variable
        const token = process.env.GITHUB_TOKEN;
        
        if (!token) {
            console.error('❌ GITHUB_TOKEN not found in environment');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'GitHub token not configured in Netlify environment variables' 
                })
            };
        }

        console.log('✅ Token found, length:', token.length);

        // Get the workflow ID
        const workflowsRes = await fetch('https://api.github.com/repos/Skatecrete/SamsmShopRepo/actions/workflows', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!workflowsRes.ok) {
            console.error('❌ Failed to list workflows:', workflowsRes.status);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: `GitHub API error: ${workflowsRes.status}` 
                })
            };
        }

        const workflowsData = await workflowsRes.json();
        const workflow = workflowsData.workflows?.find(w => w.name === 'Generate JSON from Images');

        if (!workflow) {
            console.error('❌ Workflow not found');
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Workflow "Generate JSON from Images" not found' 
                })
            };
        }

        console.log('✅ Found workflow:', workflow.id);

        // Trigger the workflow
        const response = await fetch(`https://api.github.com/repos/Skatecrete/SamsmShopRepo/actions/workflows/${workflow.id}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({ ref: 'main' })
        });

        if (response.status === 204) {
            console.log('✅ Workflow triggered successfully');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Workflow triggered successfully' 
                })
            };
        } else {
            console.error('❌ Failed to trigger workflow:', response.status);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: `GitHub API error: ${response.status}` 
                })
            };
        }
    } catch (error) {
        console.error('❌ Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error: ' + error.message 
            })
        };
    }
};
