# Deployment and CI/CD Review

This document outlines the current state of the Sanku CRM deployment pipeline, identified gaps, and implemented improvements.

## 1. Current State Assessment

### CI/CD Pipeline
- **Frontend**: Deployed via GitHub Actions to Azure Static Web Apps.
- **Backend**: Deployed via GitHub Actions to Azure Functions.
- **Trigger**: Pushes to `main` or `master` trigger immediate deployment.

### Identified Gaps
- **Lack of PR Validation**: Changes were being merged without automated checks for linting, type errors, or build stability.
- **Inconsistent Dependencies**: Used `npm install` instead of `npm ci`, which can lead to environment-specific dependency versions.
- **No Security Scanning**: Dependencies were not being audited for known vulnerabilities.
- **Manual Artifacts**: Presence of `.zip` files in the repository suggested manual deployment processes were still in use.
- **Hardcoded Config**: Some environment variables were hardcoded in workflow files.

## 2. Implemented Improvements

### Automated Validation
- **PR Validation Workflow**: Added `.github/workflows/pr-validation.yml` which runs on all Pull Requests to `main` or `master`. It performs:
    - Linting (Frontend & Backend)
    - Type Checking
    - Production Build Verification
    - Security Audit (`npm audit`)

### Enhanced Deployment Workflows
- Updated `azure-functions.yml` and `azure-static-web-apps.yml` to:
    - Use `npm ci` for deterministic builds.
    - Include linting and security audits as mandatory steps before deployment.
    - Implement GitHub Action caching to reduce build times.

### Backend Tooling
- Added `lint` and `audit` scripts to `server/package.json`.

## 3. Recommended Git Push Protocols

To maintain high reliability and security, the following branch protection rules should be enforced on the GitHub repository settings:

### Branch Protection Rules for `main` and `master`:
1. **Require a Pull Request before merging**:
    - Ensures all changes are reviewed.
    - Prevents direct pushes to production branches.
2. **Require status checks to pass before merging**:
    - **PR Validation** must pass (includes build, lint, and security checks).
3. **Require signed commits**:
    - Ensures the integrity and origin of the code.
4. **Require conversation resolution before merging**:
    - Ensures all reviewer comments are addressed.

### Local Development Workflow:
1. Always create a feature branch from `main`.
2. Push the branch and open a Pull Request.
3. Wait for the `PR Validation` workflow to complete.
4. Obtain at least one peer review.
5. Merge the PR, which will trigger the deployment to Azure.

## 4. Maintenance
- Regularly update dependencies to patch security vulnerabilities.
- Monitor Azure Function logs and Static Web App environment health.
- Avoid committing build artifacts (like `.zip` files) to the repository.
