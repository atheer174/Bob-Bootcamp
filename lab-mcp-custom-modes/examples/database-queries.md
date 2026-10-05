# Database Queries with Bob

This guide shows how to use Bob's database MCP integration to query databases, analyze data, and generate insights.

## Prerequisites

- Database MCP server configured
- Database credentials set up
- Read-only access configured for production databases

## Basic Queries

### Simple SELECT Queries

Ask Bob to query the database using natural language:

```
Query the production database for all users created in the last 7 days
```

Bob will translate this to:
```sql
SELECT * FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Aggregation Queries

```
Show me the total number of orders by status in the last month
```

Translates to:
```sql
SELECT status, COUNT(*) as count
FROM orders
WHERE created_at >= NOW() - INTERVAL '1 month'
GROUP BY status
ORDER BY count DESC;
```

## Data Analysis

### Performance Analysis

```
Analyze the performance of our API endpoints:
1. Query the logs table for the last 24 hours
2. Calculate average response time by endpoint
3. Identify slow endpoints (>1 second)
4. Show the top 10 slowest endpoints
```

### User Behavior Analysis

```
Analyze user activity:
1. Query user sessions from the last week
2. Calculate daily active users
3. Identify peak usage hours
4. Show user retention rate
```

### Sales Analysis

```
Generate a sales report:
1. Query orders from the last quarter
2. Calculate total revenue by product category
3. Identify best-selling products
4. Show month-over-month growth
```

## Schema Exploration

### Understanding Tables

```
Show me the schema for the orders table including:
- Column names and types
- Primary and foreign keys
- Indexes
- Relationships to other tables
```

### Finding Related Data

```
I need to understand how users, orders, and products are related.
Show me:
1. The table schemas
2. Foreign key relationships
3. Example queries joining these tables
```

## Data Quality Checks

### Finding Anomalies

```
Check the users table for data quality issues:
1. Find duplicate email addresses
2. Identify users with invalid email formats
3. Find users with missing required fields
4. Show users with suspicious activity patterns
```

### Validation Queries

```
Validate data integrity:
1. Check for orphaned records (foreign keys pointing to non-existent records)
2. Find records with invalid status values
3. Identify date inconsistencies (e.g., end_date before start_date)
```

## Advanced Use Cases

### Generating Reports

```
Create a monthly business report:
1. Query sales data for the current month
2. Calculate key metrics (revenue, orders, average order value)
3. Compare with previous month
4. Generate visualizations
5. Export to markdown format
```

### Database Optimization

```
Analyze query performance:
1. Identify slow queries from the logs
2. Suggest indexes that could improve performance
3. Find tables that need optimization
4. Recommend query rewrites
```

### Data Migration Planning

```
Plan a data migration:
1. Analyze the current schema
2. Identify data dependencies
3. Estimate migration time based on row counts
4. Suggest migration strategy
5. Generate migration scripts
```

## Safety Features

### Read-Only Protection

The database MCP server enforces read-only access:
- Only SELECT queries are allowed
- INSERT, UPDATE, DELETE are blocked
- DDL statements (CREATE, ALTER, DROP) are blocked

### Query Validation

```
# This will be rejected:
DELETE FROM users WHERE id = 123;

# Error: Only SELECT queries are allowed
```

### Environment Separation

Different credentials for each environment:
- Production: Read-only, restricted access
- Staging: Read-only, broader access
- Development: Read-write access

## Best Practices

1. **Be Specific**: Provide clear criteria for queries
2. **Limit Results**: Always specify limits for large tables
3. **Use Indexes**: Query indexed columns when possible
4. **Verify Results**: Review query results before using them
5. **Document Queries**: Save useful queries for reuse

## Example Workflows

### Debugging Production Issues

```
We're seeing errors for user ID 12345. Help me debug:
1. Query their recent activity
2. Check their account status
3. Review error logs related to this user
4. Identify any anomalies
```

### Customer Support

```
Customer support ticket #789 - user can't access their orders:
1. Query the user's account details
2. Check their order history
3. Verify their permissions
4. Identify any issues
5. Suggest resolution steps
```

### Business Intelligence

```
Prepare data for the quarterly board meeting:
1. Query key business metrics
2. Calculate growth rates
3. Identify trends
4. Generate executive summary
5. Create data visualizations
```

## Troubleshooting

### Connection Issues

If Bob can't connect to the database:
- Verify the MCP server is running
- Check database credentials
- Ensure network connectivity
- Review firewall rules

### Query Errors

If queries fail:
- Check table and column names
- Verify data types
- Review query syntax
- Check permissions

### Performance Issues

If queries are slow:
- Add appropriate indexes
- Limit result sets
- Use query optimization
- Consider caching frequently accessed data