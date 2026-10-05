/**
 * JIRA Integration Tools
 * 
 * Provides tools for interacting with JIRA API
 */

const axios = require('axios');

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;

/**
 * Create authentication headers for JIRA API
 */
function getAuthHeaders() {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a new JIRA ticket
 */
async function createTicket(args) {
  const { project, summary, description, issueType = 'Task', priority = 'Medium' } = args;

  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: project },
          summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: description || summary }],
              },
            ],
          },
          issuetype: { name: issueType },
          priority: { name: priority },
        },
      },
      { headers: getAuthHeaders() }
    );

    return {
      success: true,
      ticket: {
        key: response.data.key,
        id: response.data.id,
        url: `${JIRA_BASE_URL}/browse/${response.data.key}`,
      },
      message: `Created ticket ${response.data.key}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errorMessages || error.message,
    };
  }
}

/**
 * Search for JIRA tickets using JQL
 */
async function searchTickets(args) {
  const { jql, maxResults = 50 } = args;

  try {
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/search`,
      {
        params: { jql, maxResults },
        headers: getAuthHeaders(),
      }
    );

    return {
      success: true,
      total: response.data.total,
      issues: response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        priority: issue.fields.priority?.name || 'None',
        url: `${JIRA_BASE_URL}/browse/${issue.key}`,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errorMessages || error.message,
    };
  }
}

/**
 * Get ticket details
 */
async function getTicket(args) {
  const { ticketKey } = args;

  try {
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}`,
      { headers: getAuthHeaders() }
    );

    const issue = response.data;
    return {
      success: true,
      ticket: {
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        priority: issue.fields.priority?.name || 'None',
        created: issue.fields.created,
        updated: issue.fields.updated,
        url: `${JIRA_BASE_URL}/browse/${issue.key}`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errorMessages || error.message,
    };
  }
}

/**
 * Update a JIRA ticket
 */
async function updateTicket(args) {
  const { ticketKey, updates } = args;

  try {
    await axios.put(
      `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}`,
      { fields: updates },
      { headers: getAuthHeaders() }
    );

    return {
      success: true,
      message: `Updated ticket ${ticketKey}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errorMessages || error.message,
    };
  }
}

/**
 * Add comment to a JIRA ticket
 */
async function addComment(args) {
  const { ticketKey, comment } = args;

  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}/comment`,
      {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: comment }],
            },
          ],
        },
      },
      { headers: getAuthHeaders() }
    );

    return {
      success: true,
      commentId: response.data.id,
      message: `Added comment to ${ticketKey}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errorMessages || error.message,
    };
  }
}

module.exports = {
  createTicket,
  searchTickets,
  getTicket,
  updateTicket,
  addComment,
};

// Made with Bob
