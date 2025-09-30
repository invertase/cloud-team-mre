#!/usr/bin/env node

import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`\n${COLORS.blue}Running: ${command}${COLORS.reset}`);
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    return true;
  } catch (error) {
    log(`${COLORS.red}Error running command: ${command}${COLORS.reset}`, COLORS.red);
    log(`${COLORS.red}${error.message}${COLORS.reset}`, COLORS.red);
    return false;
  }
}

/**
 * Generates a CommonJS index.js file for the plugin.
 * @param {string} pluginName
 * @param {boolean} isV2
 * @param {object} additionalConfig
 * @returns {string}
 */
function generateIndexFile(pluginName, isV2 = false, additionalConfig = {}) {
  const { modelName, apiKey, customImports } = additionalConfig;
  const fullPluginName = `${pluginName}`;
  const importName = pluginName.replace(/-/g, '');

  // CommonJS syntax
  let content = `'use strict';

const { genkit } = require('genkit');
const { ${importName} } = require('${fullPluginName}');

const ai = genkit({
  plugins: [
    ${importName}({${apiKey ? `\n      apiKey: process.env.${apiKey},` : ''}${modelName ? `\n      models: ['${modelName}'],` : ''}
    }),
  ],
});

${customImports || ''}

// Basic health check endpoint
ai.defineFlow({
  name: '${isV2 ? 'v2_' : 'v1_'}healthCheck',
  output: {
    status: 'string',
    version: 'string',
    timestamp: 'string',
  }
}, async () => {
  return {
    status: 'healthy',
    version: '${isV2 ? 'v2' : 'v1'}',
    timestamp: new Date().toISOString(),
  };
});

// Sample generation flow
ai.defineFlow({
  name: '${isV2 ? 'v2_' : 'v1_'}generateText',
  input: {
    prompt: 'string',
  },
  output: {
    text: 'string',
    version: 'string',
  }
}, async ({ prompt }) => {
  const { text } = await ai.generate({
    model: '${modelName || 'gemini-1.5-flash'}',
    prompt,
  });

  return {
    text,
    version: '${isV2 ? 'v2' : 'v1'}',
  };
});

module.exports = ai;
`;

  return content;
}

async function main() {
  log(`${COLORS.bright}🔧 Genkit Plugin Migration Setup Tool${COLORS.reset}\n`);
  log('This tool will help you automatically set up your Genkit plugin migration environment.\n');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'pluginName',
        message: 'What is the plugin name you want to migrate? (e.g., @genkit-ai/google-genai)',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a plugin name.';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'v2PluginPath',
        message: 'What is the path to your v2 plugin? (relative or absolute path)',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a plugin path for v2.';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'modelName',
        message: 'What model name should be used in the sample flows? (optional)',
        default: 'gemini-1.5-flash'
      },
      {
        type: 'confirm',
        name: 'includeApiKey',
        message: 'Does this plugin require an API key?',
        default: false
      },
      {
        type: 'input',
        name: 'apiKeyEnvVar',
        message: 'What environment variable name should be used for the API key?',
        default: (answers) => `${answers.pluginName.toUpperCase().replace(/-/g, '_')}_API_KEY`,
        when: (answers) => answers.includeApiKey
      },
      {
        type: 'confirm',
        name: 'generateSampleFlows',
        message: 'Would you like to generate sample flows for testing?',
        default: true
      },
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Would you like to automatically install the dependencies?',
        default: true
      },
      {
        type: 'list',
        name: 'startAfterSetup',
        message: 'Which version would you like to start after setup?',
        choices: [
          { name: 'Start v1 (old api)', value: 'v1' },
          { name: 'Start v2 (new api, your migration)', value: 'v2' },
          { name: 'Do not start anything', value: 'none' }
        ],
        default: 'none'
      }
    ]);

    const fullPluginName = `${answers.pluginName}`;

    log(`\n${COLORS.yellow}📋 Setup Summary:${COLORS.reset}`);
    log(`   Plugin (v1): ${fullPluginName}`);
    log(`   Plugin (v2): ${answers.v2PluginPath}`);
    log(`   Model: ${answers.modelName}`);
    log(`   API Key: ${answers.includeApiKey ? answers.apiKeyEnvVar : 'Not required'}`);
    log(`   Generate samples: ${answers.generateSampleFlows ? 'Yes' : 'No'}`);
    log(`   Install deps: ${answers.installDependencies ? 'Yes' : 'No'}`);
    log(`   Start after setup: ${answers.startAfterSetup === 'none' ? 'No' : `Yes (${answers.startAfterSetup})`}\n`);

    const proceed = await inquirer.prompt([{
      type: 'confirm',
      name: 'continue',
      message: 'Do you want to continue with this setup?',
      default: true
    }]);

    if (!proceed.continue) {
      log(`${COLORS.yellow}Setup cancelled.${COLORS.reset}`);
      return;
    }

    // Step 1: Install v1 plugin
    log(`\n${COLORS.green}📦 Installing v1 plugin...${COLORS.reset}`);
    if (answers.installDependencies) {
      const v1Success = runCommand(`npm install ${fullPluginName}@latest --save`, './v1');
      if (!v1Success) {
        log(`${COLORS.red}Failed to install v1 plugin. Please check the plugin name and try again.${COLORS.reset}`);
        return;
      }
    }

    // Step 2: Install v2 plugin
    log(`\n${COLORS.green}📦 Installing v2 plugin...${COLORS.reset}`);
    if (answers.installDependencies) {
      const v2Success = runCommand(`npm install "${answers.v2PluginPath}" --save`, './v2');
      if (!v2Success) {
        log(`${COLORS.red}Failed to install v2 plugin. Please check the path and try again.${COLORS.reset}`);
        return;
      }
    }

    // Step 3: Generate index.js files
    if (answers.generateSampleFlows) {
      log(`\n${COLORS.green}📝 Generating index.js files...${COLORS.reset}`);

      const commonConfig = {
        modelName: answers.modelName,
        apiKey: answers.includeApiKey ? answers.apiKeyEnvVar : null,
      };

      // Generate v1 index.js
      const v1Content = generateIndexFile(answers.pluginName, false, commonConfig);
      writeFileSync('./v1/index.js', v1Content);
      log(`   ✓ Generated v1/index.js`);

      // Generate v2 index.js (use same plugin name since it's the same plugin, just different version)
      const v2Content = generateIndexFile(answers.pluginName, true, commonConfig);
      writeFileSync('./v2/index.js', v2Content);
      log(`   ✓ Generated v2/index.js`);
    }

    // Step 4: Create .env template (only if API key is needed)
    if (answers.includeApiKey) {
      log(`\n${COLORS.green}🔐 Creating environment template...${COLORS.reset}`);
      const envContent = `# Add your API key here
${answers.apiKeyEnvVar}=your_api_key_here

# Other environment variables as needed
# PORT=4000
`;
      writeFileSync('./.env.example', envContent);
      log(`   ✓ Created .env.example`);
    }

    // Step 5: Install root dependencies
    if (answers.installDependencies) {
      log(`\n${COLORS.green}📦 Installing root dependencies...${COLORS.reset}`);
      runCommand('npm install');
    }

    // Step 6: Start the application
    if (answers.startAfterSetup !== 'none') {
      log(`\n${COLORS.green}🚀 Starting ${answers.startAfterSetup} version...${COLORS.reset}`);
      if (answers.includeApiKey) {
        log(`${COLORS.yellow}Note: Make sure to set up your ${answers.apiKeyEnvVar} environment variable first!${COLORS.reset}`);
      }
      runCommand(`npm run start:${answers.startAfterSetup}`);
    }

    log(`\n${COLORS.bright}${COLORS.green}✅ Setup Complete!${COLORS.reset}\n`);
    log(`${COLORS.yellow}Next steps:${COLORS.reset}`);
    if (answers.includeApiKey) {
      log(`1. Copy .env.example to .env and add your API key`);
      log(`2. Review and customize the generated index.js files if needed`);
    } else {
      log(`1. Review and customize the generated index.js files if needed`);
    }
    log(`${answers.includeApiKey ? '3' : '2'}. Run 'npm run start:v1' to start v1 or 'npm run start:v2' to start v2`);
    log(`${answers.includeApiKey ? '4' : '3'}. Visit the Genkit Developer UI (usually http://localhost:4000)`);
    log(`${answers.includeApiKey ? '5' : '4'}. Test your flows and compare by switching between versions\n`);
    log(`${COLORS.yellow}💡 Tip: Run one version, test it, stop it, then run the other version to compare!${COLORS.reset}`);

  } catch (error) {
    log(`${COLORS.red}❌ Setup failed: ${error.message}${COLORS.reset}`, COLORS.red);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`${COLORS.red}Unexpected error: ${error.message}${COLORS.reset}`, COLORS.red);
  process.exit(1);
});
