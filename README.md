# Cloud Platform Team MRE Repository

This repository contains Minimal Reproducible Examples (MREs) for the Cloud Platform Team at Invertase. Each MRE is designed to help reproduce and debug specific issues or demonstrate particular functionality.

## Repository Structure

Each MRE should be organized in its own branch, following this directory structure:

```
<organization>/<repository>/<mre-directory>
```

For example:
```
firebase/firebase-functions/issue-123
```

## Guidelines

1. **Branch Naming**: Create a new branch for each MRE
2. **Directory Structure**: Follow the organization/repository pattern
3. **Documentation**: Each MRE should include its own `README.md` with:
   - Setup instructions
   - Prerequisites
   - Steps to reproduce
   - Expected behavior
   - Actual behavior (if applicable)

## Creating a New MRE

1. Create a new branch from `main`
2. Create the appropriate directory structure
3. Add your MRE code and documentation

## Best Practices

- Keep MREs minimal and focused on the specific issue
- Include all necessary configuration files
- Document any environment variables or secrets needed
- Provide clear steps to reproduce the issue
- Include expected vs actual behavior

