exports.handler = async (event) => {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GitHub token not configured' })
        };
    }
    
    try {
        // Get the workflow ID first
        const workflowsRes = await fetch('https://api.github.com/repos/Skatecrete/SamsmShopRepo/actions/workflows', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const workflowsData = await workflowsRes.json();
        const workflow = workflowsData.workflows?.find(w => w.name === 'Generate JSON from Images');
        
        if (!workflow) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Workflow not found' })
            };
        }
        
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
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Workflow triggered successfully' })
            };
        } else {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to trigger workflow' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
