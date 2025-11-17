#!/usr/bin/env node

/**
 * StackShift MCP Server
 *
 * Exposes StackShift's 6-gear reverse engineering process as MCP tools and resources.
 * Works with Claude Code, VSCode with Copilot, and any MCP-compatible client.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { analyzeToolHandler } from './tools/analyze.js';
import { reverseEngineerToolHandler } from './tools/reverse-engineer.js';
import { createSpecsToolHandler } from './tools/create-specs.js';
import { gapAnalysisToolHandler } from './tools/gap-analysis.js';
import { completeSpecToolHandler } from './tools/complete-spec.js';
import { implementToolHandler } from './tools/implement.js';
import { cruiseControlToolHandler } from './tools/cruise-control.js';
import { generateRoadmapToolHandler } from './tools/generate-roadmap.js';
import { generateAllSpecsToolHandler } from './tools/generate-all-specs.js';
import { createConstitutionToolHandler } from './tools/create-constitution.js';
import { createFeatureSpecsToolHandler } from './tools/create-feature-specs.js';
import { createImplPlansToolHandler } from './tools/create-impl-plans.js';
import { getStateResource, getProgressResource, getRouteResource } from './resources/index.js';

const server = new Server(
  {
    name: 'stackshift',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * List available tools (6 gears)
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'stackshift_analyze',
        description:
          'Gear 1: Analyze codebase, detect tech stack, choose route (Greenfield or Brownfield)',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory (defaults to current working directory)',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description:
                'Route choice: greenfield (extract business logic) or brownfield (full stack)',
            },
          },
        },
      },
      {
        name: 'stackshift_reverse_engineer',
        description:
          'Gear 2: Extract comprehensive documentation (8 files) based on selected route',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
          },
        },
      },
      {
        name: 'stackshift_create_specs',
        description: 'Gear 3: Generate GitHub Spec Kit specifications in .specify/ directory',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
          },
        },
      },
      {
        name: 'stackshift_gap_analysis',
        description: 'Gear 4: Run /speckit.analyze and create prioritized implementation roadmap',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
          },
        },
      },
      {
        name: 'stackshift_complete_spec',
        description: 'Gear 5: Interactive clarification to resolve [NEEDS CLARIFICATION] markers',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            clarifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
              description: 'Array of clarification questions and answers',
            },
          },
        },
      },
      {
        name: 'stackshift_implement',
        description: 'Gear 6: Use /speckit.implement to systematically build features from specs',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            feature: {
              type: 'string',
              description: 'Feature name to implement (from .specify/memory/specifications/)',
            },
          },
        },
      },
      {
        name: 'stackshift_cruise_control',
        description:
          'Cruise Control: Automatic mode - shift through all 6 gears sequentially without stopping',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description: 'Route choice (required)',
            },
            clarifications_strategy: {
              type: 'string',
              enum: ['defer', 'prompt', 'skip'],
              description: 'How to handle clarifications (default: defer)',
            },
            implementation_scope: {
              type: 'string',
              enum: ['none', 'p0', 'p0_p1', 'all'],
              description: 'What to implement in Gear 6 (default: none)',
            },
          },
          required: ['route'],
        },
      },
      {
        name: 'stackshift_generate_roadmap',
        description:
          'F008: Generate strategic roadmap from gap analysis - Analyzes gaps between specs and implementation, identifies missing features, and generates prioritized roadmap with phases and timelines',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory (defaults to current directory)',
            },
            outputFormat: {
              type: 'string',
              enum: ['markdown', 'json', 'csv', 'html', 'all'],
              description: 'Export format (defaults to markdown)',
            },
            includeFeatureBrainstorming: {
              type: 'boolean',
              description: 'Whether to brainstorm desirable features (default: false)',
            },
            confidenceThreshold: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Minimum confidence for gap inclusion (0-100, default: 50)',
            },
            teamSize: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              description: 'Team size for timeline estimation (default: 2)',
            },
          },
        },
      },
      {
        name: 'stackshift_generate_all_specs',
        description:
          'F002: Automated Spec Generation - Generate constitution, feature specs, and implementation plans automatically',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description: 'Route choice (optional if already set via analyze)',
            },
          },
        },
      },
      {
        name: 'stackshift_create_constitution',
        description:
          'F002: Generate constitution.md from functional specification',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description: 'Route choice',
            },
            outputPath: {
              type: 'string',
              description: 'Custom output path (default: .specify/memory/constitution.md)',
            },
          },
        },
      },
      {
        name: 'stackshift_create_feature_specs',
        description:
          'F002: Extract features and generate individual spec files',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description: 'Route choice',
            },
          },
        },
      },
      {
        name: 'stackshift_create_impl_plans',
        description:
          'F002: Generate implementation plans for PARTIAL and MISSING features',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Path to project directory',
            },
            route: {
              type: 'string',
              enum: ['greenfield', 'brownfield'],
              description: 'Route choice',
            },
          },
        },
      },
    ],
  };
});

/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'stackshift://state',
        name: 'Workflow State',
        description: 'Current StackShift workflow state (.stackshift-state.json)',
        mimeType: 'application/json',
      },
      {
        uri: 'stackshift://progress',
        name: 'Progress Through Gears',
        description: 'Progress through the 6-gear process',
        mimeType: 'application/json',
      },
      {
        uri: 'stackshift://route',
        name: 'Selected Route',
        description: 'Current route (greenfield or brownfield)',
        mimeType: 'text/plain',
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'stackshift_analyze':
        return await analyzeToolHandler(args || {});

      case 'stackshift_reverse_engineer':
        return await reverseEngineerToolHandler(args || {});

      case 'stackshift_create_specs':
        return await createSpecsToolHandler(args || {});

      case 'stackshift_gap_analysis':
        return await gapAnalysisToolHandler(args || {});

      case 'stackshift_complete_spec':
        return await completeSpecToolHandler(args || {});

      case 'stackshift_implement':
        return await implementToolHandler(args || {});

      case 'stackshift_cruise_control':
        return await cruiseControlToolHandler(args || {} as any);

      case 'stackshift_generate_roadmap':
        return await generateRoadmapToolHandler(args || {});

      case 'stackshift_generate_all_specs':
        return await generateAllSpecsToolHandler(args || {});

      case 'stackshift_create_constitution':
        return await createConstitutionToolHandler(args || {});

      case 'stackshift_create_feature_specs':
        return await createFeatureSpecsToolHandler(args || {});

      case 'stackshift_create_impl_plans':
        return await createImplPlansToolHandler(args || {});

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Handle resource reads
 */
server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'stackshift://state':
        return await getStateResource();

      case 'stackshift://progress':
        return await getProgressResource();

      case 'stackshift://route':
        return await getRouteResource();

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('StackShift MCP Server running');
  console.error(
    'Shift through 6 gears: analyze → reverse-engineer → create-specs → gap-analysis → complete-spec → implement'
  );
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
