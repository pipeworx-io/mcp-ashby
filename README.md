# mcp-ashby

Ashby MCP Pack — wraps the Ashby ATS API

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `ashby_list_candidates` | Search candidates in your ATS. Returns names, emails, and application metadata. Use ashby_get_candidate with ID for full profile details. |
| `ashby_get_candidate` | Get full candidate profile by ID. Returns contact info, resume, interview history, and current application status. |
| `ashby_list_jobs` | Search open positions. Filter by status (open, closed, draft, archived). Returns job title, department, and posting details. |
| `ashby_get_job` | Get full job posting by ID. Returns description, requirements, hiring stage, and applicant count. |
| `ashby_list_applications` | Search job applications across positions. Returns candidate name, applied job, application stage, and submission date. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ashby": {
      "url": "https://gateway.pipeworx.io/ashby/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ashby data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
