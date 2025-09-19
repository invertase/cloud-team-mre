# Genkit Plugin Migrations

This template will help you test your Genkit plugin migration.

## Directory Structure

```
- v1 (the v1 api, of which you are migrating from)
  - package.json
  - index.js
- v2 (the v2 api, of which you are migrating to)
  - package.json
  - index.js
- package.json (the root package.json, which contains the scripts to start each version of the plugin)
```

## Setup

### Automated Setup (Recommended)

Use the interactive setup script to automatically configure your migration environment:

```bash
npm run setup
```

This script will:
- Prompt you for the plugin name and paths
- Install dependencies for both v1 and v2
- Generate sample `index.js` files with basic flows
- Create a `.env.example` file with environment variable templates
- Optionally start one version after setup

### Manual Setup (Alternative)

If you prefer manual setup:

1. In `v1/package.json`, change the plugin '@genkit-ai/google-genai' to the plugin you are migrating. You can do this with the following command: `cd v1 && npm install <plugin-name>@latest --save`.
2. In `v2/package.json`, change the plugin '@genkit-ai/google-genai' to the plugin you are migrating. You should use your local changes, hence install the plugin from your own directory with the following command: `cd v2 && npm install <plugin-path> --save`. For example, if your plugin is in the `../plugins/my-plugin` directory, you should run `cd v2 && npm install ../plugins/my-plugin --save`.
  - Install example A (relative path): `cd v2; npm install ../plugins/google-genai --save`
  - Install example B (Windows absolute path): `cd v2; npm install C:\Users\joshu\Desktop\genkit\plugins\google-genai --save`
  - Install example C (Mac absolute path): `cd v2; npm install /Users/joshu/Desktop/genkit/plugins/google-genai --save`
3. Adjust the `index.js` file in both directories to use the plugin you are migrating.
4. Once you are done, you can run `npm run start:v1` to start the v1 version or `npm run start:v2` to start the v2 version. Test one version, stop it, then start the other to compare the differences (hopefully none). **Note: Each version will run on port 4000.**

## Environment Variables

After setup, make sure to configure your environment variables:

1. Copy `.env.example` to `.env` (if API key is required)
2. Add your API key(s) and other required configuration
3. Adjust any additional environment variables as needed

## Running and Testing

To test your migration:

1. **Start v1**: `npm run start:v1`
   - Test your flows in the Genkit Developer UI (http://localhost:4000)
   - Take note of the behavior and responses
   - Stop the server (Ctrl+C)

2. **Start v2**: `npm run start:v2`
   - Test the same flows with identical inputs
   - Compare the behavior and responses with v1
   - Look for any differences or regressions

This approach avoids port conflicts and makes it easier to do direct comparisons.

## Checklist

- [ ] Ensure the plugin name in each version of the plugin is the same.

**Ensure how many of each type of component is available in each version of the plugin is the same.**
- [ ] Models
- [ ] Embedders
- [ ] Tools
- [ ] Indexers
- [ ] Retrievers
- [ ] Evaluators

**Ensure the names of each type of component available in each version of the plugin is the same.**
- [ ] Models
- [ ] Embedders
- [ ] Tools
- [ ] Indexers
- [ ] Retrievers
- [ ] Evaluators

**For each type of component (model, embedder, tool, indexer, retriever, evaluator), verify that at least one instance produces the same behavior (though, outputs may differ) in both plugin versions when tested with identical inputs.**
- [ ] Models
- [ ] Embedders
- [ ] Tools
- [ ] Indexers
- [ ] Retrievers
- [ ] Evaluators

- [ ] Use a flow to operate a model, embedder, tool, indexer, retriever, or evaluator, and verify that the behavior is the same (though, outputs may differ) in both plugin versions.