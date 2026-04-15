interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Ashby MCP Pack — wraps the Ashby ATS API
 *
 * BYO key: _apiKey (Ashby API key).
 * Auth: Basic auth with apiKey as username, empty password.
 * All endpoints are POST with JSON body.
 * Tools: list/get candidates, list/get jobs, list applications.
 */


const API = 'https://api.ashbyhq.com';

function authHeaders(apiKey: string): Record<string, string> {
  const encoded = btoa(`${apiKey}:`);
  return {
    Authorization: `Basic ${encoded}`,
    'Content-Type': 'application/json',
  };
}

async function ashbyPost(apiKey: string, path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ashby API error (${res.status}): ${text}`);
  }
  return res.json();
}

// -- Tool definitions --------------------------------------------------------

const tools: McpToolExport['tools'] = [
  {
    name: 'ashby_list_candidates',
    description:
      'List candidates from Ashby. Returns candidate names, emails, and metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Ashby API key' },
        cursor: { type: 'string', description: 'Pagination cursor from a previous response' },
        per_page: { type: 'number', description: 'Number of candidates per page (default 50)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'ashby_get_candidate',
    description:
      'Get details for a specific candidate by their ID. Returns full candidate profile.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Ashby API key' },
        candidateId: { type: 'string', description: 'Ashby candidate ID' },
      },
      required: ['_apiKey', 'candidateId'],
    },
  },
  {
    name: 'ashby_list_jobs',
    description:
      'List jobs from Ashby. Optionally filter by status (open, closed, draft, archived).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Ashby API key' },
        status: {
          type: 'string',
          description: 'Filter by job status: Open, Closed, Draft, Archived',
        },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'ashby_get_job',
    description:
      'Get details for a specific job by its ID. Returns full job posting information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Ashby API key' },
        jobId: { type: 'string', description: 'Ashby job ID' },
      },
      required: ['_apiKey', 'jobId'],
    },
  },
  {
    name: 'ashby_list_applications',
    description:
      'List job applications from Ashby. Returns application details including candidate and job info.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Ashby API key' },
        cursor: { type: 'string', description: 'Pagination cursor from a previous response' },
        per_page: { type: 'number', description: 'Number of applications per page (default 50)' },
      },
      required: ['_apiKey'],
    },
  },
];

// -- callTool dispatcher -----------------------------------------------------

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string | undefined;
  delete args._context;
  delete args._apiKey;

  if (!apiKey) throw new Error('_apiKey is required for Ashby API access');

  switch (name) {
    case 'ashby_list_candidates': {
      const body: Record<string, unknown> = {};
      if (args.cursor) body.cursor = args.cursor;
      if (args.per_page) body.perPage = args.per_page;
      return ashbyPost(apiKey, '/candidate.list', body);
    }
    case 'ashby_get_candidate':
      return ashbyPost(apiKey, '/candidate.info', { candidateId: args.candidateId as string });
    case 'ashby_list_jobs': {
      const body: Record<string, unknown> = {};
      if (args.status) body.status = args.status;
      return ashbyPost(apiKey, '/job.list', body);
    }
    case 'ashby_get_job':
      return ashbyPost(apiKey, '/job.info', { jobId: args.jobId as string });
    case 'ashby_list_applications': {
      const body: Record<string, unknown> = {};
      if (args.cursor) body.cursor = args.cursor;
      if (args.per_page) body.perPage = args.per_page;
      return ashbyPost(apiKey, '/application.list', body);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 } } satisfies McpToolExport;
