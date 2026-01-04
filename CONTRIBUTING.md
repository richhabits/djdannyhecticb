# Contributing to DJ Danny Hectic B

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Follow enterprise-level coding standards

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and configure
4. Run database migrations: `pnpm db:push`
5. Start development server: `pnpm dev`

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Code Style
- Follow Prettier formatting (run `pnpm format`)
- Use meaningful variable and function names
- Keep functions focused and single-purpose
- Add JSDoc comments for public APIs

### Git Commit Messages
- Use conventional commits format
- Prefix with type: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep first line under 72 characters
- Provide detailed description if needed

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Run `pnpm check` and `pnpm format`
4. Ensure all tests pass
5. Create a pull request with clear description
6. Address review feedback promptly

## Project Structure

- `server/` - Backend code (Node.js/Express/tRPC)
- `client/` - Frontend code (React/Vite)
- `drizzle/` - Database schema and migrations
- `docs/` - Documentation
- `shared/` - Shared types and utilities

## Questions?

Open an issue or contact the maintainers.

