# Architecture

## Project Vision

alexa-gpt is an AI assistant that brings useful, safe, conversational assistance to Amazon Alexa. Its primary interface will be an Alexa Skill running on AWS Lambda, while its core behavior remains independent of Alexa, Lambda, and OpenAI.

The project uses a simplified Clean Architecture to make the core application easy to test, evolve, and expose through additional channels. Telegram, a web UI, and a CLI must be able to reuse the same application services without duplicating business rules or being coupled to Alexa-specific request and response formats.

The current stack is Node.js, TypeScript, the official OpenAI SDK and Responses API, Pino, and Zod. AWS Lambda and Alexa Skills Kit are planned delivery mechanisms, not dependencies of the core design.

## High-Level Architecture

The intended request path for Alexa is:

```text
Alexa
  ↓
AWS Lambda / Alexa adapter
  ↓
Application Service
  ↓
AI Client (domain interface)
  ↓
OpenAI Responses API
```

The channel adapter translates an external request into an application command, calls an application service, and translates the result back into the channel's response format. It must not contain business rules.

```text
Alexa ───────┐
Telegram ───┼──> Channel adapters ──> Application services ──> Domain ports
Web UI ─────┤                                      │                │
CLI ────────┘                                      │                └──> Infrastructure adapters
                                                   │                         (OpenAI, persistence, tools)
                                                   └──> Shared policies
```

Future channels reuse the Application layer and its domain interfaces. They do not call OpenAI or storage adapters directly.

## Layers

### Domain

The Domain layer contains the stable language of the product: entities, value objects, policies, and interfaces (ports) such as `AIClient`. It has no dependency on infrastructure frameworks, SDKs, environment variables, or transport protocols.

Domain interfaces define what the application needs, not how a provider implements it. For example, `AIClient` returns plain text and never exposes OpenAI SDK objects.

### Application

The Application layer coordinates use cases. Services such as `AIService` receive dependencies through interfaces, enforce application-level rules, and return application-friendly results. It owns orchestration, conversation flow, authorization decisions when applicable, and recovery decisions for typed failures.

It does not know whether a request originated from Alexa, Telegram, HTTP, or a command line.

### Infrastructure

Infrastructure implements external concerns and domain ports: OpenAI clients, Alexa/Lambda adapters, configuration, logging, persistence, HTTP clients, and third-party integrations. It may depend on SDKs such as `openai`, `ask-sdk-*`, Pino, and Zod.

Infrastructure converts provider-specific failures and data into typed, application-safe forms. It must not contain business rules.

### Shared

Shared contains small, framework-independent cross-cutting primitives used by more than one layer: typed errors, result helpers, and narrowly scoped utilities. It must not become a catch-all folder or hide domain behavior that belongs in Domain or Application.

## Dependency Rule

Dependencies point inward:

```text
Infrastructure ──> Application ──> Domain
       │                 │
       └───────────────> Shared
Application ──────────> Shared
Domain ───────────────> Shared (only when truly generic)
```

Outer layers depend on inner layers; inner layers never depend on outer layers. In particular:

- Domain must not import Application, Infrastructure, AWS, Alexa, OpenAI, Pino, Zod, or Node environment APIs.
- Application must not import an OpenAI client, Lambda handler, Alexa request type, or `process.env`.
- Infrastructure may implement Domain interfaces and compose Application services.
- Provider SDK types stay inside Infrastructure. Public domain and application contracts use project-owned types only.

Dependency injection enforces this rule: the composition root creates concrete infrastructure adapters and passes them to application services as domain interfaces.

## Expected Folder Structure

```text
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   └── interfaces/
│       └── AIClient.ts
├── application/
│   ├── services/
│   │   └── AIService.ts
│   ├── commands/
│   └── dto/
├── infrastructure/
│   ├── ai/
│   │   ├── OpenAIClient.ts
│   │   ├── prompts/
│   │   │   └── systemPrompt.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── schema.ts
│   │   └── config.ts
│   ├── logger/
│   │   ├── logger.ts
│   │   └── index.ts
│   ├── alexa/
│   ├── persistence/
│   └── composition/
│       └── bootstrap.ts
├── shared/
│   ├── errors/
│   └── result/
└── index.ts
```

`index.ts` is the runtime entry point. A composition or bootstrap module is responsible for assembling concrete adapters, validating startup configuration, and starting the selected channel. It should contain wiring, not business logic.

## Design Principles

- **SOLID:** modules have clear responsibilities, depend on abstractions, and remain open to new adapters without changing core use cases.
- **Dependency injection:** application services receive interfaces rather than constructing provider clients.
- **Composition over inheritance:** build behavior by composing focused services and adapters; use inheritance only when it represents a real, stable is-a relationship.
- **Single Responsibility:** a module should have one reason to change. Prompt construction, OpenAI transport, conversation storage, and Alexa response rendering remain separate.
- **Fail fast:** configuration and required dependencies are validated at startup, before serving requests.
- **Explicit errors:** expected operational failures use typed project errors with safe messages and causal context.
- **Strong typing:** compiler-checked project contracts cross layer boundaries; avoid `any`, unvalidated input, and provider-shaped data in the core.
- **Immutable configuration:** the validated configuration object is created once and never mutated at runtime.

## Error Handling

Infrastructure detects provider, network, serialization, and persistence failures, then throws typed project errors rather than leaking SDK exceptions. Errors include a safe message for callers and preserve the original cause for observability.

Application services decide how to respond: retry an operation where it is safe, return a fallback response, map an error to a channel-safe outcome, or allow the error to reach the adapter. Channel adapters map final errors to channel-specific responses and never disclose credentials, raw provider payloads, or stack traces to users.

Unexpected errors are logged once at the appropriate boundary with structured context. Do not silently swallow failures.

## Logging

Pino is the single logging implementation. The infrastructure logger exports a singleton used through the application composition root and adapters.

- Production logs are structured JSON for ingestion, querying, and alerting.
- Development uses `pino-pretty` for readable local output.
- `console.log`, `console.error`, and ad-hoc logging are prohibited.
- Log structured context such as request ID, channel, operation, latency, and safe error metadata.
- Never log API keys, access tokens, private conversation content, or unredacted provider payloads.

## Configuration

All configuration comes from the typed infrastructure configuration module. It loads environment values, validates them with Zod at startup, applies documented defaults, and exports an immutable configuration object.

No other module may read `process.env` directly. Application and Domain code receive configuration-derived values through constructors or interfaces only. Secrets are supplied through environment-specific secret management in deployed environments and never committed to source control.

## Future Roadmap

The architecture is intentionally prepared for these additions:

- **AIService:** application use case that coordinates prompt construction, AI generation, and response policies through `AIClient`.
- **Conversation Memory:** a domain-facing repository interface with infrastructure implementations for short-term and durable conversation context.
- **Tool Calling:** application orchestration and domain tool contracts; infrastructure adapters for external capabilities, with explicit authorization and validation.
- **Prompt Library:** versioned, focused prompt modules that can be composed by application services without embedding prompts in transport code.
- **Vector Store:** a repository/knowledge-retrieval port with replaceable vector database adapters.
- **Home Assistant:** an infrastructure integration behind domain tool interfaces, never called directly from an Alexa handler.
- **Telegram:** a channel adapter that maps Telegram updates to existing application services.
- **Web UI:** an HTTP or realtime channel adapter that reuses the same commands, DTOs, and application services.

## Coding Standards

- Keep functions small, cohesive, and named for the business action they perform.
- Prefer composition and explicit dependencies over global state and inheritance.
- Keep business logic out of Infrastructure; adapters translate data and call application services.
- Keep OpenAI SDK types, request objects, and response objects inside Infrastructure.
- Validate all untrusted input at its boundary.
- Use immutable values by default and avoid mutation that crosses module boundaries.
- Add tests at the layer that owns the behavior: domain/application tests should use fakes; infrastructure tests should cover provider mappings and integrations.
- Keep public interfaces minimal and stable so new providers and channels can be introduced without changing core use cases.
