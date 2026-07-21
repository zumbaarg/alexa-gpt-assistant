# Copilot and Codex Instructions

## Project

This repository is an AI Assistant for Amazon Alexa, written in TypeScript. It follows a simplified Clean Architecture and is designed to support future channels and providers without coupling core behavior to a delivery mechanism or SDK.

## Architecture

- Always respect layer boundaries: `domain`, `application`, `infrastructure`, and `shared`.
- Dependencies point inward. Outer layers may depend on inner layers; inner layers must never depend on outer layers.
- Never create circular dependencies.
- Keep business logic in the Application or Domain layers.
- Infrastructure contains implementations and adapters for external systems.
- Do not expose external SDK types outside Infrastructure.
- Prefer dependency injection for dependencies that vary by environment, provider, or test.

## General Rules

- Write production-ready code.
- Prefer readability and maintainability over cleverness or brevity.
- Use explicit types at public boundaries and for non-obvious values.
- Avoid `any`; use narrow project-owned types, `unknown`, and type guards when needed.
- Avoid unnecessary abstractions and speculative generalization.
- Keep files focused and modules cohesive.
- Each function must have a single responsibility.
- Prefer immutable values and avoid mutable shared state.
- Do not use static state unless it is an intentional, documented singleton such as the infrastructure logger.

## Configuration

- Never access `process.env` outside the typed infrastructure configuration module.
- Always consume configuration through the immutable typed `config` export.
- Validate configuration at startup and fail fast with descriptive errors.
- Never hard-code secrets, credentials, environment-specific URLs, or model configuration.

## Logging

- Never use `console.log`, `console.error`, or other console methods.
- Always use the logger singleton from Infrastructure.
- Use structured logs with useful, safe context.
- Do not log API keys, tokens, secrets, unredacted provider payloads, or private conversation content.
- Use JSON logs in production and pretty logs only in development.

## Errors

- Throw typed `Error` subclasses; never throw strings or arbitrary values.
- Never swallow exceptions.
- Preserve a failure's cause when wrapping it.
- Infrastructure must translate third-party exceptions into project-owned typed errors before they cross the boundary.
- Application services decide how typed errors are handled, retried, mapped, or returned to a channel.

## Naming and Files

- Use `PascalCase` for classes, interfaces, and types.
- Use `camelCase` for functions, methods, variables, and object properties.
- Use `UPPER_CASE` for constants that are truly constant and broadly shared.
- File names should match their primary exported symbol, for example `OpenAIClient.ts` or `AIClient.ts`.
- Prefer barrel exports for a module's public API.
- Avoid deep relative imports when path aliases become available.

## Application Layer

- Contains use cases and business orchestration.
- Must not import the OpenAI SDK, AWS SDK, Alexa SDK, HTTP frameworks, or `process.env`.
- Depends on Domain interfaces rather than concrete Infrastructure implementations.
- Returns project-owned DTOs, values, and typed errors only.

## Infrastructure Layer

- Contains adapters, providers, configuration, logging, persistence, and channel integrations.
- May depend on external libraries and SDKs.
- Implements Domain interfaces and translates external data and exceptions at the boundary.
- Must not contain business rules.
- Must not leak SDK request, response, error, or client types into Domain or Application.

## OpenAI

- Use the OpenAI Responses API for new AI interactions.
- Do not use Chat Completions unless explicitly required.
- Keep the OpenAI SDK isolated within Infrastructure.
- Return project-owned types or plain text from the AI boundary, never OpenAI SDK objects.
- Read the API key and model only from the typed configuration module.

## Testing

- Write code that is testable in isolation.
- Prefer dependency injection and interfaces so Application and Domain tests can use fakes.
- Keep unit tests independent from network access, provider credentials, AWS, and Alexa.
- Test provider adapters separately for request mapping, response mapping, and error translation.

## Comments and Style

- Write comments only to explain *why*, trade-offs, constraints, or non-obvious decisions.
- Do not write comments that restate obvious code.
- Keep functions small.
- Prefer early returns.
- Avoid nested conditionals when a guard clause or extracted function is clearer.
- Prefer composition over inheritance.

## Future Components

Design additions so they can fit the existing boundaries:

- Conversation Memory
- Prompt Manager
- Tool Calling
- Knowledge Base
- Vector Search
- Multiple AI providers

New providers and channels must implement or consume existing domain contracts rather than bypassing Application services.

## Code Review Standard

Generate code that can pass a Senior Engineer review. Prioritize maintainability, clear ownership, explicit error behavior, testability, and architecture compliance over short or clever implementations.
