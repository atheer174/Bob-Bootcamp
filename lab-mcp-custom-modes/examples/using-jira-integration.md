# Using JIRA Integration with Bob

This guide demonstrates how to use Bob's JIRA MCP integration to manage issues, track work, and automate workflows.

## Prerequisites

- JIRA MCP server configured and running
- JIRA API credentials set up
- Bob connected to the MCP server

## Basic Operations

### Creating Issues

Ask Bob to create JIRA issues using natural language:

```
Create a JIRA issue:
- Project: PROJ
- Type: Bug
- Summary: Login page returns 500 error
- Description: Users are unable to log in due to server error
- Priority: High
- Assignee: john.doe
```

Bob will use the `create_jira_issue` tool to create the issue and return the issue key.

### Searching Issues

Find issues using JQL or natural language:

```
Find all high-priority bugs assigned to me that are in progress
```

```
Search JIRA for issues:
- Project: PROJ
- Status: In Progress
- Assignee: currentUser()
- Type: Bug
- Priority: High
```

### Updating Issues

Update issue status, assignee, or other fields:

```
Update JIRA issue PROJ-123:
- Status: In Review
- Add comment: "Fixed the authentication logic, ready for review"
```

### Transitioning Issues

Move issues through workflow states:

```
Transition JIRA issue PROJ-456 to Done and add comment "Deployed to production"
```

## Advanced Workflows

### Automated Bug Triage

```
Review the code changes in the last commit and:
1. Identify any potential bugs
2. Create JIRA issues for each bug found
3. Link them to the current sprint
4. Assign to the appropriate team members
```

### Sprint Planning

```
Analyze the JIRA backlog and:
1. Identify high-priority items
2. Estimate story points based on complexity
3. Suggest items for the next sprint
4. Create a sprint plan document
```

### Release Management

```
For release v2.1.0:
1. Find all JIRA issues marked for this release
2. Check their status
3. Identify any blockers
4. Generate a release notes document
5. Update issue statuses to Released
```

## Integration with Code

### Linking Commits to Issues

```
Review my recent commits and:
1. Extract JIRA issue keys from commit messages
2. Add commit information as comments to those issues
3. Update issue status if commits indicate completion
```

### Code Review Workflow

```
For pull request #123:
1. Find the related JIRA issue
2. Review the code changes
3. Add code review comments to the JIRA issue
4. Update issue status based on review outcome
```

## Best Practices

1. **Use Issue Keys**: Always reference JIRA issues by their key (e.g., PROJ-123)
2. **Provide Context**: Give Bob enough context about what you're trying to accomplish
3. **Verify Results**: Always verify that Bob's actions completed successfully
4. **Use Templates**: Create reusable prompts for common workflows

## Troubleshooting

### Issue Not Found

If Bob can't find an issue:
- Verify the issue key is correct
- Check that you have permission to view the issue
- Ensure the MCP server is connected

### Permission Errors

If you get permission errors:
- Verify your JIRA API credentials
- Check that your user has the required permissions
- Contact your JIRA administrator if needed

## Example Prompts

### Daily Standup Report

```
Generate my daily standup report:
1. List JIRA issues I worked on yesterday
2. Show issues I'm working on today
3. Identify any blockers
4. Format as a standup update
```

### Sprint Retrospective

```
Analyze the completed sprint:
1. Get all issues completed in the sprint
2. Calculate velocity
3. Identify patterns in issue types
4. Suggest improvements for next sprint
```

### Bug Analysis

```
Analyze bugs created in the last month:
1. Group by component
2. Identify most common bug types
3. Find patterns in bug reports
4. Suggest areas for improvement