import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Prisma client initialization
// Assumes the server is run with DATABASE_URL in environment or via .env
const prisma = new PrismaClient();

const server = new Server(
  {
    name: "kitchenbay-testing-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schemas
const InteractiveBrowserActionSchema = z.object({
  url: z.string().optional().describe("URL to navigate to (if not already on the correct page)"),
  selector: z.string().optional().describe("CSS selector of element to interact with"),
  action: z.enum(["click", "fill", "verify_visible", "verify_text", "screenshot"]).describe("Action to perform"),
  value: z.string().optional().describe("Value to fill in input (required if action is fill, or text to verify for verify_text)"),
});

const VerifyDbRecordSchema = z.object({
  model: z.string().describe("Prisma model name (e.g., 'product', 'order')"),
  where: z.string().describe("JSON string representing the 'where' clause for prisma (e.g., '{\"name\":\"New Product\"}')"),
});

const RunE2eTestSchema = z.object({
  testName: z.enum(["add_product_flow"]).describe("Name of the predefined E2E test to run"),
});

const AnalyzeProjectSchema = z.object({});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_project",
        description: "Returns an overview of the KitchenBay project architecture, routes, and database schema",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "verify_db_record",
        description: "Query the Neon DB directly via Prisma to verify if a record exists. Useful for validating backend saves after UI actions.",
        inputSchema: {
          type: "object",
          properties: {
            model: { type: "string", description: "Prisma model (e.g. 'product', 'user')" },
            where: { type: "string", description: "JSON representation of where clause" }
          },
          required: ["model", "where"],
        },
      },
      {
        name: "interactive_browser_action",
        description: "Uses Playwright to interact with a page (click, fill) or verify elements.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            selector: { type: "string" },
            action: { type: "string", enum: ["click", "fill", "verify_visible", "verify_text", "screenshot"] },
            value: { type: "string" }
          },
          required: ["action"],
        },
      },
      {
        name: "run_e2e_test",
        description: "Executes a complete E2E Playwright test flow and returns the result.",
        inputSchema: {
          type: "object",
          properties: {
            testName: { type: "string", enum: ["add_product_flow"] }
          },
          required: ["testName"]
        }
      }
    ],
  };
});

// Single browser instance for the session
let browserInstance: any = null;
let pageInstance: any = null;

async function getPage() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
    const context = await browserInstance.newContext();
    pageInstance = await context.newPage();
  }
  return pageInstance;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "analyze_project") {
      const parentDir = path.join(__dirname, "..", "..");
      const pkgPath = path.join(parentDir, "package.json");
      const schemaPath = path.join(parentDir, "prisma", "schema.prisma");
      
      let pkgInfo = "Not found";
      let schemaInfo = "Not found";
      
      if (fs.existsSync(pkgPath)) pkgInfo = fs.readFileSync(pkgPath, "utf-8");
      if (fs.existsSync(schemaPath)) schemaInfo = fs.readFileSync(schemaPath, "utf-8");

      return {
        content: [{
          type: "text",
          text: `Project analysis complete.\n\n# package.json deps:\n${pkgInfo.substring(0, 500)}...\n\n# Prisma Schema:\n${schemaInfo}`
        }],
      };
    }

    if (name === "verify_db_record") {
      const parsed = VerifyDbRecordSchema.parse(args);
      const model = parsed.model.toLowerCase();
      const whereObj = JSON.parse(parsed.where);
      
      // Dynamic invocation of Prisma client
      const delegate = (prisma as any)[model];
      if (!delegate) {
        throw new Error(`Prisma model '${model}' not found.`);
      }

      const result = await delegate.findFirst({ where: whereObj });
      return {
        content: [{
          type: "text",
          text: result ? `Record found:\n${JSON.stringify(result, null, 2)}` : "No matching record found."
        }]
      };
    }

    if (name === "interactive_browser_action") {
      const parsed = InteractiveBrowserActionSchema.parse(args);
      const page = await getPage();

      if (parsed.url) {
        await page.goto(parsed.url);
      }

      let resultText = "Action completed.";

      switch (parsed.action) {
        case "click":
          if (!parsed.selector) throw new Error("Selector required for click");
          await page.click(parsed.selector);
          resultText = `Clicked ${parsed.selector}`;
          break;
        case "fill":
          if (!parsed.selector || parsed.value === undefined) throw new Error("Selector and value required for fill");
          await page.fill(parsed.selector, parsed.value);
          resultText = `Filled ${parsed.selector} with ${parsed.value}`;
          break;
        case "verify_visible":
          if (!parsed.selector) throw new Error("Selector required for verify_visible");
          const isVisible = await page.isVisible(parsed.selector);
          resultText = isVisible ? `Element ${parsed.selector} is visible.` : `Element ${parsed.selector} is NOT visible.`;
          break;
        case "verify_text":
          if (!parsed.selector || !parsed.value) throw new Error("Selector and value required for verify_text");
          const text = await page.innerText(parsed.selector);
          resultText = text.includes(parsed.value) ? `Text matches.` : `Text mismatch: found '${text}'`;
          break;
        case "screenshot":
          const buffer = await page.screenshot();
          const b64 = buffer.toString('base64');
          return {
            content: [
              { type: "text", text: "Screenshot captured:" },
              {
                type: "image",
                data: b64,
                mimeType: "image/png"
              }
            ]
          };
      }

      return {
        content: [{ type: "text", text: resultText }]
      };
    }

    if (name === "run_e2e_test") {
      const parsed = RunE2eTestSchema.parse(args);
      if (parsed.testName === "add_product_flow") {
        const page = await getPage();
        await page.goto("http://localhost:3000/admin/products/add");
        await page.fill('input[name="name"]', "E2E Test Product");
        await page.fill('input[name="price"]', "500");
        await page.click('button[type="submit"]');
        return {
          content: [{ type: "text", text: "Successfully ran add_product_flow test." }]
        };
      }
    }

    throw new Error(`Tool '${name}' not found.`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KitchenBay Testing MCP Server started on stdio");
}

startServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
