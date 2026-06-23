const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json');
const serverConfig = {
  command: "node",
  args: [
    "c:/Users/yousuf.suhail_cloud-/Desktop/precom/kitchenBay/mcp-server/dist/index.js"
  ],
  env: {
    "DATABASE_URL": "postgresql://neondb_owner:npg_rCSIZxFfm0v5@ep-shiny-water-aosx6e79-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  }
};

let config = {};

if (fs.existsSync(configPath)) {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    if (fileContent.trim()) {
      config = JSON.parse(fileContent);
    }
  } catch (err) {
    console.log("Existing config was empty or invalid, creating new one.");
  }
}

if (!config.mcpServers) {
  config.mcpServers = {};
}

config.mcpServers['kitchenbay-testing-server'] = serverConfig;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log("✅ Successfully updated " + configPath);
console.log("The KitchenBay Testing Server is now registered as a plug-and-play tool!");
