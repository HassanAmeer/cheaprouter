# Custom Provider Development

<cite>
**Referenced Files in This Document**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/index.ts](file://backend/src/index.ts)
- [backend/src/conversations.ts](file://backend/src/conversations.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains how to implement custom AI providers within the project’s provider abstraction layer. It covers the architecture, interface requirements, implementation patterns, authentication and API key management, streaming responses, configuration, rate limiting, cost tracking, error handling strategies, and testing approaches. The goal is to enable developers to extend the existing provider system to support new AI services with minimal friction while maintaining consistency across the platform.

## Project Structure
The provider system spans both backend logic and Next.js API routes:
- Backend core modules define provider abstractions, key management, usage tracking, and database access.
- Next.js API routes expose endpoints for chat completions, streaming, models listing, provider CRUD, and key management.

```mermaid
graph TB
subgraph "Backend Core"
P["providers.ts"]
K["keys.ts"]
U["usage.ts"]
DB["db.ts"]
C["conversations.ts"]
A["auth.ts"]
I["index.ts"]
end
subgraph "Next.js API Routes"
V1Chat["v1/chat/completions/route.ts"]
Stream["stream/route.ts"]
Models["models/route.ts"]
ProvAPI["providers/route.ts"]
ProvID["providers/[id]/route.ts"]
KeysAPI["keys/route.ts"]
KeysID["keys/[id]/route.ts"]
end
V1Chat --> P
Stream --> P
Models --> P
ProvAPI --> P
ProvID --> P
KeysAPI --> K
KeysID --> K
P --> U
P --> DB
P --> C
P --> A
I --> P
```

**Diagram sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [backend/src/conversations.ts](file://backend/src/conversations.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/index.ts](file://backend/src/index.ts)
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/index.ts](file://backend/src/index.ts)
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)

## Core Components
- Provider Abstraction Layer: Defines a unified interface for invoking AI models, including non-streaming and streaming modes, model discovery, and metadata.
- Key Management: Secure storage and retrieval of provider-specific credentials (e.g., API keys), with lifecycle operations.
- Usage Tracking: Aggregates token counts, request counts, and cost metrics per provider and model.
- Database Access: Persists provider configurations, keys, usage records, and conversation history.
- Authentication: Validates user sessions and scopes for protected endpoints.
- API Routes: Expose REST endpoints for chat completions, streaming, models, providers, and keys.

Key responsibilities:
- Normalize requests across providers.
- Enforce rate limits and quotas.
- Track costs and usage consistently.
- Provide consistent error semantics.

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/conversations.ts](file://backend/src/conversations.ts)

## Architecture Overview
The provider abstraction sits at the center of the system. API routes orchestrate authentication, validation, routing to the appropriate provider, and response formatting. Providers encapsulate vendor-specific HTTP calls, streaming handling, and normalization into a common contract.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Route as "v1/chat/completions route"
participant Auth as "Auth"
participant Prov as "Provider Abstraction"
participant KV as "Keys Store"
participant Usage as "Usage Tracker"
participant DB as "Database"
Client->>Route : "POST /api/v1/chat/completions"
Route->>Auth : "Validate session and permissions"
Auth-->>Route : "User context"
Route->>Prov : "Resolve provider by id/model"
Prov->>KV : "Fetch provider credentials"
KV-->>Prov : "Credentials"
Prov->>DB : "Load provider config and rate limits"
DB-->>Prov : "Config + limits"
Prov->>Prov : "Normalize request and apply rate limit checks"
alt Non-streaming
Prov-->>Route : "Normalized response"
else Streaming
Prov-->>Route : "Stream chunks"
end
Route->>Usage : "Record tokens/costs"
Usage->>DB : "Persist usage"
Route-->>Client : "Response or stream"
```

**Diagram sources**
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)

## Detailed Component Analysis

### Provider Abstraction Interface
The provider abstraction defines a uniform contract that all concrete providers must implement. Typical responsibilities include:
- Model listing and capabilities
- Chat completion invocation (non-streaming)
- Chat completion streaming
- Request/response normalization
- Error mapping and retry policies
- Rate limiting and quota enforcement hooks
- Cost calculation inputs (tokens, pricing tiers)

Implementation pattern:
- Create a provider module implementing the interface.
- Register the provider with the central registry.
- Ensure consistent error types and metadata.

```mermaid
classDiagram
class ProviderInterface {
+listModels() Promise~ModelInfo[]~
+chatCompletion(request) Promise~ChatResponse~
+chatCompletionStream(request) AsyncIterable~Chunk~
+normalizeRequest(input) NormalizedRequest
+mapError(err) ProviderError
+calculateCost(tokens, model) CostInfo
}
class ConcreteProviderA {
+listModels()
+chatCompletion(request)
+chatCompletionStream(request)
+normalizeRequest(input)
+mapError(err)
+calculateCost(tokens, model)
}
class ConcreteProviderB {
+listModels()
+chatCompletion(request)
+chatCompletionStream(request)
+normalizeRequest(input)
+mapError(err)
+calculateCost(tokens, model)
}
ProviderInterface <|.. ConcreteProviderA
ProviderInterface <|.. ConcreteProviderB
```

**Diagram sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)

### Key Management
Securely manage provider credentials:
- Create, read, update, delete keys associated with providers.
- Encrypt sensitive values at rest.
- Scope keys to users or tenants.
- Validate presence before invoking providers.

```mermaid
flowchart TD
Start(["Create Key"]) --> Validate["Validate payload and permissions"]
Validate --> Encrypt["Encrypt secret value"]
Encrypt --> Persist["Persist to database"]
Persist --> ReturnOK["Return created key metadata"]
ReturnOK --> End(["Done"])
```

**Diagram sources**
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)

**Section sources**
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)

### Usage Tracking and Cost Integration
Track usage and compute costs:
- Count tokens and requests per provider/model.
- Apply pricing rules to calculate cost.
- Persist usage records for analytics and billing.

```mermaid
flowchart TD
Entry(["After Completion"]) --> Extract["Extract tokens and model info"]
Extract --> Compute["Compute cost using pricing rules"]
Compute --> Record["Record usage event"]
Record --> Persist["Persist to database"]
Persist --> Done(["Done"])
```

**Diagram sources**
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)

**Section sources**
- [backend/src/usage.ts](file://backend/src/usage.ts)

### Authentication and Authorization
Protect provider-related endpoints:
- Validate user sessions and roles.
- Ensure users can only access their own keys and providers.
- Enforce scope-based access for admin operations.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Route as "Protected Route"
participant Auth as "Auth Middleware"
participant DB as "Database"
Client->>Route : "Request with auth header"
Route->>Auth : "Verify token and extract user"
Auth->>DB : "Lookup user and permissions"
DB-->>Auth : "User context"
Auth-->>Route : "Authorized"
Route-->>Client : "Response"
```

**Diagram sources**
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/db.ts](file://backend/src/db.ts)

**Section sources**
- [backend/src/auth.ts](file://backend/src/auth.ts)

### API Routes Orchestration
- v1/chat/completions: Normalizes input, resolves provider, invokes provider, tracks usage, returns response or stream.
- stream: Handles server-sent events or chunked transfer for streaming responses.
- models: Lists available models from registered providers.
- providers: CRUD for provider definitions and configuration.
- keys: CRUD for provider credentials.

```mermaid
sequenceDiagram
participant Client as "Client"
participant ChatRoute as "v1/chat/completions"
participant StreamRoute as "stream"
participant Prov as "Provider Abstraction"
participant Usage as "Usage Tracker"
Client->>ChatRoute : "Non-streaming request"
ChatRoute->>Prov : "Invoke provider"
Prov-->>ChatRoute : "Response"
ChatRoute->>Usage : "Record usage"
ChatRoute-->>Client : "Response"
Client->>StreamRoute : "Streaming request"
StreamRoute->>Prov : "Start stream"
loop Chunks
Prov-->>StreamRoute : "Chunk"
StreamRoute-->>Client : "SSE/Chunk"
end
StreamRoute->>Usage : "Record final usage"
```

**Diagram sources**
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)

**Section sources**
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)

### Step-by-Step: Creating a Custom Provider
1. Define provider metadata and capabilities.
2. Implement the provider interface:
   - listModels
   - chatCompletion
   - chatCompletionStream
   - normalizeRequest
   - mapError
   - calculateCost
3. Register the provider with the central registry.
4. Add provider-specific configuration fields and secrets.
5. Wire up rate limiting and quota checks.
6. Add tests for normal flows, errors, and streaming.

```mermaid
flowchart TD
Plan["Plan provider features"] --> Implement["Implement interface methods"]
Implement --> Register["Register provider"]
Register --> Configure["Add config and secrets"]
Configure --> Test["Write unit/integration tests"]
Test --> Deploy["Deploy and validate"]
```

[No sources needed since this section provides general guidance]

### Handling Authentication and API Keys
- Use the key management module to store and retrieve provider credentials securely.
- Inject credentials into provider requests during invocation.
- Rotate keys without downtime by supporting multiple active keys and fallbacks.

**Section sources**
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)

### Implementing Streaming Responses
- For streaming, return an async iterable or SSE-compatible stream.
- Map provider-specific streaming formats to a normalized chunk structure.
- Ensure proper cleanup and error propagation on stream termination.

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)

### Error Handling Strategies
- Normalize provider errors into a common schema.
- Distinguish transient vs permanent errors; apply retries for transient cases.
- Include actionable messages and codes for clients.

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)

### Testing Approaches
- Unit tests: Mock provider HTTP calls and verify normalization and error mapping.
- Integration tests: Use test fixtures and sandboxed endpoints to validate end-to-end flows.
- Streaming tests: Assert chunk ordering and final aggregated result.
- Security tests: Verify key encryption and access controls.

[No sources needed since this section provides general guidance]

### Configuration, Rate Limiting, and Cost Tracking
- Configuration: Store provider settings (base URL, headers, timeouts) in the database and load them at runtime.
- Rate Limiting: Enforce per-provider and per-model limits; reject requests exceeding quotas.
- Cost Tracking: Integrate pricing tables and compute costs based on tokens and model tier.

**Section sources**
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)

## Dependency Analysis
The following diagram shows dependencies between core modules and API routes.

```mermaid
graph LR
V1["v1/chat/completions/route.ts"] --> P["providers.ts"]
Stream["stream/route.ts"] --> P
Models["models/route.ts"] --> P
ProvAPI["providers/route.ts"] --> P
ProvID["providers/[id]/route.ts"] --> P
KeysAPI["keys/route.ts"] --> K["keys.ts"]
KeysID["keys/[id]/route.ts"] --> K
P --> U["usage.ts"]
P --> DB["db.ts"]
P --> C["conversations.ts"]
P --> A["auth.ts"]
I["index.ts"] --> P
```

**Diagram sources**
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [backend/src/conversations.ts](file://backend/src/conversations.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/index.ts](file://backend/src/index.ts)

**Section sources**
- [backend/src/index.ts](file://backend/src/index.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/db.ts](file://backend/src/db.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)
- [backend/src/conversations.ts](file://backend/src/conversations.ts)
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)

## Performance Considerations
- Prefer streaming for long-running generations to reduce latency and memory pressure.
- Cache model listings and static provider configs where safe.
- Batch usage recording to minimize database writes.
- Tune timeouts and concurrency per provider to avoid overload.
- Implement circuit breakers for failing providers to protect overall availability.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing or invalid API keys: Verify key existence and permissions via key management endpoints.
- Rate limit exceeded: Check provider quotas and adjust limits or back off.
- Streaming interruptions: Ensure proper cleanup and reconnection logic; log partial usage.
- Inconsistent costs: Validate pricing rules and token counting logic.
- Authentication failures: Inspect token validity and user scopes.

**Section sources**
- [backend/src/keys.ts](file://backend/src/keys.ts)
- [backend/src/providers.ts](file://backend/src/providers.ts)
- [backend/src/usage.ts](file://backend/src/usage.ts)
- [backend/src/auth.ts](file://backend/src/auth.ts)

## Conclusion
By adhering to the provider abstraction interface and leveraging shared modules for keys, usage, and authentication, you can integrate new AI providers quickly and consistently. Focus on robust normalization, clear error semantics, streaming support, and accurate cost tracking to deliver a reliable multi-provider experience.

## Appendices

### API Reference Summary
- Chat Completions: POST /api/v1/chat/completions
- Streaming: GET/POST /api/stream (provider-dependent)
- Models: GET /api/models
- Providers: CRUD /api/providers and /api/providers/:id
- Keys: CRUD /api/keys and /api/keys/:id

**Section sources**
- [src/app/api/v1/chat/completions/route.ts](file://src/app/api/v1/chat/completions/route.ts)
- [src/app/api/stream/route.ts](file://src/app/api/stream/route.ts)
- [src/app/api/models/route.ts](file://src/app/api/models/route.ts)
- [src/app/api/providers/route.ts](file://src/app/api/providers/route.ts)
- [src/app/api/providers/[id]/route.ts](file://src/app/api/providers/[id]/route.ts)
- [src/app/api/keys/route.ts](file://src/app/api/keys/route.ts)
- [src/app/api/keys/[id]/route.ts](file://src/app/api/keys/[id]/route.ts)