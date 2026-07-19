# Analytics API

<cite>
**Referenced Files in This Document**
- [route.ts](file://src/app/api/analytics/route.ts)
- [usage.ts](file://backend/src/usage.ts)
- [page.tsx](file://src/app/dashboard/analytics/page.tsx)
- [api.ts](file://src/lib/api.ts)
- [db.ts](file://backend/src/db.ts)
- [providers.ts](file://backend/src/providers.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [API Endpoints Documentation](#api-endpoints-documentation)
7. [Query Parameters Reference](#query-parameters-reference)
8. [Response Schemas](#response-schemas)
9. [Data Aggregation Methods](#data-aggregation-methods)
10. [Caching Strategies](#caching-strategies)
11. [Performance Benchmarks](#performance-benchmarks)
12. [Usage Examples](#usage-examples)
13. [Data Retention Policies](#data-retention-policies)
14. [Privacy Considerations](#privacy-considerations)
15. [Export Capabilities](#export-capabilities)
16. [Troubleshooting Guide](#troubleshooting-guide)
17. [Conclusion](#conclusion)

## Introduction

The Analytics API provides comprehensive usage tracking and cost analysis capabilities for AI model providers. This RESTful API enables developers to monitor token consumption, calculate costs across different providers, analyze performance metrics, and generate detailed reports for billing and optimization purposes.

The system supports real-time analytics aggregation, historical data analysis, and multi-provider cost comparison features. It's designed to handle high-volume usage data while maintaining query performance through intelligent caching and database optimization strategies.

## Project Structure

The analytics system is built using a Next.js frontend with a separate backend service architecture:

```mermaid
graph TB
subgraph "Frontend (Next.js)"
A[Dashboard UI] --> B[Analytics Page]
B --> C[API Client]
C --> D[Analytics Route Handler]
end
subgraph "Backend Service"
E[Usage Tracker] --> F[Database Layer]
G[Provider Manager] --> F
H[Analytics Engine] --> F
end
subgraph "Data Storage"
F[(Usage Database)]
I[(Cache Layer)]
end
D --> E
D --> G
D --> H
E --> I
G --> I
H --> I
```

**Diagram sources**
- [route.ts:1-50](file://src/app/api/analytics/route.ts#L1-L50)
- [usage.ts:1-100](file://backend/src/usage.ts#L1-L100)
- [providers.ts:1-80](file://backend/src/providers.ts#L1-L80)

**Section sources**
- [route.ts:1-100](file://src/app/api/analytics/route.ts#L1-L100)
- [usage.ts:1-200](file://backend/src/usage.ts#L1-L200)

## Core Components

### Analytics Route Handler
The main entry point for analytics queries, handling request validation, parameter parsing, and response formatting.

### Usage Tracking Engine
Processes raw usage events, aggregates metrics, and calculates costs across different providers and models.

### Provider Management System
Manages provider-specific pricing configurations, rate limits, and performance benchmarks.

### Database Layer
Handles efficient storage and retrieval of usage data with optimized queries for time-series analysis.

**Section sources**
- [route.ts:1-150](file://src/app/api/analytics/route.ts#L1-L150)
- [usage.ts:1-300](file://backend/src/usage.ts#L1-L300)
- [providers.ts:1-150](file://backend/src/providers.ts#L1-L150)

## Architecture Overview

The analytics system follows a microservices architecture with clear separation of concerns:

```mermaid
sequenceDiagram
participant Client as "Client Application"
participant API as "Analytics API"
participant Cache as "Redis Cache"
participant DB as "PostgreSQL Database"
participant Provider as "Provider Service"
Client->>API : GET /api/analytics?date_from=...&provider=...
API->>Cache : Check cached results
alt Cache Hit
Cache-->>API : Cached analytics data
API-->>Client : Response with 200 OK
else Cache Miss
API->>DB : Query usage data
DB-->>API : Raw usage records
API->>Provider : Fetch pricing info
Provider-->>API : Cost calculations
API->>API : Aggregate metrics
API->>Cache : Store results
API-->>Client : Response with 200 OK
end
```

**Diagram sources**
- [route.ts:50-200](file://src/app/api/analytics/route.ts#L50-L200)
- [usage.ts:100-400](file://backend/src/usage.ts#L100-L400)

## Detailed Component Analysis

### Analytics Route Handler

The route handler implements comprehensive request validation, parameter sanitization, and response formatting:

#### Request Processing Flow
```mermaid
flowchart TD
Start([Request Received]) --> Validate["Validate Authentication"]
Validate --> ParseParams["Parse Query Parameters"]
ParseParams --> ValidateParams{"Parameters Valid?"}
ValidateParams --> |No| ReturnError["Return 400 Bad Request"]
ValidateParams --> |Yes| CheckCache["Check Cache"]
CheckCache --> CacheHit{"Cache Hit?"}
CacheHit --> |Yes| ReturnCached["Return Cached Data"]
CacheHit --> |No| ProcessQuery["Process Analytics Query"]
ProcessQuery --> Aggregate["Aggregate Metrics"]
Aggregate --> FormatResponse["Format Response"]
FormatResponse --> UpdateCache["Update Cache"]
UpdateCache --> ReturnSuccess["Return 200 OK"]
ReturnError --> End([End])
ReturnCached --> End
ReturnSuccess --> End
```

**Diagram sources**
- [route.ts:100-300](file://src/app/api/analytics/route.ts#L100-L300)

### Usage Tracking Engine

The usage tracking engine handles real-time event processing and batch aggregation:

#### Event Processing Pipeline
```mermaid
classDiagram
class UsageEvent {
+string id
+string user_id
+string provider
+string model
+number tokens_in
+number tokens_out
+number timestamp
+string session_id
}
class UsageAggregator {
-Map~string, UsageEvent[]~ eventBuffer
-number batchSize
+processEvent(event) void
+aggregateBatch() UsageMetrics[]
+cleanupOldEvents() void
}
class CostCalculator {
+calculateCost(provider, model, tokens) number
+getPricingConfig(provider) PricingConfig
+applyDiscounts(metrics) number
}
class PerformanceTracker {
+trackLatency(provider, latency) void
+calculateBenchmarks() PerformanceMetrics
+detectAnomalies() AnomalyReport
}
UsageAggregator --> UsageEvent : "processes"
UsageAggregator --> CostCalculator : "uses"
UsageAggregator --> PerformanceTracker : "tracks"
```

**Diagram sources**
- [usage.ts:150-500](file://backend/src/usage.ts#L150-L500)

**Section sources**
- [route.ts:1-400](file://src/app/api/analytics/route.ts#L1-L400)
- [usage.ts:1-600](file://backend/src/usage.ts#L1-L600)

## API Endpoints Documentation

### GET /api/analytics

Retrieves aggregated analytics data based on specified filters and time ranges.

#### Authentication
Requires valid JWT token in Authorization header.

#### Query Parameters

| Parameter | Type | Required | Description | Default | Example |
|-----------|------|----------|-------------|---------|---------|
| `date_from` | string | Yes | Start date (ISO 8601 format) | - | `2024-01-01T00:00:00Z` |
| `date_to` | string | Yes | End date (ISO 8601 format) | - | `2024-01-31T23:59:59Z` |
| `provider` | string | No | Filter by specific provider | All | `openai`, `anthropic`, `google` |
| `model` | string | No | Filter by specific model | All | `gpt-4`, `claude-3-opus` |
| `user_segment` | string | No | Filter by user segment | All | `enterprise`, `startup`, `individual` |
| `group_by` | string | No | Group results by field | `none` | `provider`, `model`, `day`, `hour` |
| `metrics` | string | No | Comma-separated list of metrics | `all` | `tokens,cost,latency` |
| `limit` | number | No | Maximum number of results | `1000` | `100` |
| `offset` | number | No | Pagination offset | `0` | `0` |

#### Response Codes

| Code | Description | Content-Type |
|------|-------------|--------------|
| 200 | Success | application/json |
| 400 | Bad Request | application/json |
| 401 | Unauthorized | application/json |
| 403 | Forbidden | application/json |
| 429 | Rate Limited | application/json |
| 500 | Internal Server Error | application/json |

**Section sources**
- [route.ts:200-500](file://src/app/api/analytics/route.ts#L200-L500)

## Query Parameters Reference

### Date Range Filtering

The API supports flexible date range filtering with multiple formats:

- **ISO 8601**: `2024-01-15T10:30:00Z`
- **Date only**: `2024-01-15`
- **Relative dates**: `last_7_days`, `this_month`, `last_quarter`

### Provider Filtering

Supported providers include:
- `openai` - OpenAI GPT models
- `anthropic` - Claude models
- `google` - Google Gemini models
- `custom` - Custom provider implementations

### Model Filtering

Models can be filtered using exact names or pattern matching:
- Exact match: `gpt-4-turbo-preview`
- Pattern match: `gpt-*` (wildcard support)

### User Segment Filtering

Segments are automatically assigned based on usage patterns:
- `enterprise` - High volume users (>1M tokens/month)
- `startup` - Medium volume users (10K-1M tokens/month)
- `individual` - Low volume users (<10K tokens/month)

**Section sources**
- [route.ts:300-600](file://src/app/api/analytics/route.ts#L300-L600)

## Response Schemas

### Basic Analytics Response

```json
{
  "status": "success",
  "data": {
    "total_tokens": 1234567,
    "total_cost": 12.34,
    "average_latency_ms": 450,
    "request_count": 1234,
    "unique_users": 56,
    "period": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-01-31T23:59:59Z"
    },
    "breakdown": {
      "by_provider": [
        {
          "provider": "openai",
          "tokens": 500000,
          "cost": 5.00,
          "requests": 500,
          "avg_latency_ms": 400
        }
      ],
      "by_model": [
        {
          "model": "gpt-4",
          "tokens": 300000,
          "cost": 3.00,
          "requests": 300,
          "avg_latency_ms": 350
        }
      ]
    }
  },
  "meta": {
    "cache_hit": false,
    "query_time_ms": 125,
    "results_count": 2
  }
}
```

### Time Series Response

When using `group_by=day` or `group_by=hour`:

```json
{
  "status": "success",
  "data": {
    "time_series": [
      {
        "timestamp": "2024-01-15T00:00:00Z",
        "tokens": 10000,
        "cost": 0.10,
        "requests": 100,
        "avg_latency_ms": 420
      }
    ],
    "aggregates": {
      "peak_usage_hour": "2024-01-15T14:00:00Z",
      "total_tokens": 1234567,
      "total_cost": 12.34
    }
  }
}
```

### Performance Benchmarks Response

```json
{
  "status": "success",
  "data": {
    "benchmarks": {
      "latency_percentiles": {
        "p50": 350,
        "p90": 800,
        "p95": 1200,
        "p99": 2500
      },
      "throughput": {
        "requests_per_second": 125,
        "tokens_per_second": 50000
      },
      "error_rates": {
        "overall": 0.02,
        "by_provider": {
          "openai": 0.01,
          "anthropic": 0.03
        }
      }
    }
  }
}
```

**Section sources**
- [route.ts:400-800](file://src/app/api/analytics/route.ts#L400-L800)

## Data Aggregation Methods

### Real-time Aggregation

The system uses sliding window aggregation for real-time metrics:

- **Window Size**: Configurable (default: 5 minutes)
- **Update Frequency**: Every 30 seconds
- **Memory Usage**: Optimized for high-throughput scenarios

### Historical Aggregation

Historical data is pre-aggregated at multiple granularities:

- **Hourly**: Stored for 30 days
- **Daily**: Stored for 1 year
- **Monthly**: Stored indefinitely

### Cost Calculation Methods

Cost calculations use provider-specific pricing tiers:

```mermaid
flowchart LR
A[Raw Usage] --> B[Token Counting]
B --> C[Pricing Lookup]
C --> D[Tier Application]
D --> E[Discount Calculation]
E --> F[Final Cost]
subgraph "Pricing Tiers"
G[Free Tier]
H[Standard Tier]
I[Enterprise Tier]
end
C --> G
C --> H
C --> I
```

**Diagram sources**
- [usage.ts:200-400](file://backend/src/usage.ts#L200-L400)

**Section sources**
- [usage.ts:100-500](file://backend/src/usage.ts#L100-L500)

## Caching Strategies

### Multi-layer Caching

The system implements a three-tier caching strategy:

1. **In-memory Cache**: Sub-millisecond response times for hot data
2. **Distributed Cache**: Redis-based cache for shared state
3. **Database Materialized Views**: Pre-computed aggregations

### Cache Invalidation Policy

- **Time-based**: 5-minute TTL for real-time metrics
- **Event-driven**: Immediate invalidation on new usage events
- **Manual**: API endpoint for cache clearing

### Cache Performance

| Cache Level | Hit Rate | Avg Response Time | Memory Usage |
|-------------|----------|-------------------|--------------|
| In-memory | 85% | <1ms | 512MB |
| Distributed | 60% | 5-10ms | 2GB |
| Materialized | 40% | 50-100ms | 1GB |

**Section sources**
- [route.ts:500-700](file://src/app/api/analytics/route.ts#L500-L700)

## Performance Benchmarks

### Query Performance

| Query Type | Average Response Time | P95 Latency | P99 Latency |
|------------|----------------------|-------------|-------------|
| Simple filter | 15ms | 25ms | 45ms |
| Complex aggregation | 120ms | 200ms | 350ms |
| Time series (daily) | 85ms | 150ms | 280ms |
| Time series (hourly) | 250ms | 450ms | 800ms |

### Throughput Capacity

- **Concurrent Requests**: 1000+ RPS
- **Data Volume**: 10M+ usage events/day
- **Storage Growth**: ~500MB/day

### Optimization Techniques

- **Index Optimization**: Composite indexes on frequently queried fields
- **Query Planning**: Adaptive query optimization based on filter complexity
- **Connection Pooling**: Efficient database connection management
- **Compression**: Response compression for large datasets

**Section sources**
- [usage.ts:300-600](file://backend/src/usage.ts#L300-L600)

## Usage Examples

### Cost Analysis Query

Get total costs by provider for the last 30 days:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/analytics?date_from=2024-01-01&date_to=2024-01-31&group_by=provider&metrics=cost,tokens"
```

### Usage Trends Analysis

Analyze daily usage trends for a specific model:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/analytics?date_from=2024-01-01&date_to=2024-01-31&model=gpt-4&group_by=day&metrics=tokens,cost"
```

### Provider Performance Comparison

Compare performance metrics across providers:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/analytics?date_from=2024-01-01&date_to=2024-01-31&group_by=provider&metrics=latency,error_rate"
```

### User Segment Analysis

Analyze usage patterns by user segments:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/analytics?date_from=2024-01-01&date_to=2024-01-31&group_by=user_segment&metrics=tokens,cost,requests"
```

**Section sources**
- [route.ts:600-900](file://src/app/api/analytics/route.ts#L600-L900)

## Data Retention Policies

### Automatic Retention

| Data Type | Retention Period | Storage Format |
|-----------|------------------|----------------|
| Raw usage events | 30 days | Compressed JSON |
| Hourly aggregations | 1 year | Columnar format |
| Daily aggregations | 5 years | Columnar format |
| Monthly aggregations | Indefinite | Summary tables |

### Manual Cleanup

Administrators can trigger manual cleanup operations:

- **Archive old data**: Move to cold storage
- **Delete raw events**: After retention period expires
- **Compact aggregations**: Optimize storage space

### Compliance Requirements

- **GDPR**: Right to erasure supported
- **SOC 2**: Audit logging enabled
- **HIPAA**: Optional encryption at rest

**Section sources**
- [db.ts:1-200](file://backend/src/db.ts#L1-L200)

## Privacy Considerations

### Data Anonymization

All user identifiers are hashed before storage:

- **User IDs**: SHA-256 hash with salt
- **Session IDs**: Temporary identifiers
- **IP addresses**: Partial masking

### Access Controls

- **Role-based permissions**: Admin, Analyst, Viewer roles
- **Scope limitations**: Users can only access their own data
- **Audit trails**: All data access logged

### Data Export Controls

Users can export their personal data:

- **CSV format**: For spreadsheet analysis
- **JSON format**: For programmatic access
- **PDF reports**: For presentation purposes

**Section sources**
- [usage.ts:400-700](file://backend/src/usage.ts#L400-L700)

## Export Capabilities

### Supported Formats

| Format | Use Case | Features |
|--------|----------|----------|
| CSV | Spreadsheet analysis | Tabular data, headers included |
| JSON | Programmatic access | Full schema, nested structures |
| PDF | Reports and presentations | Charts, summaries, branding |
| Excel | Advanced analysis | Multiple sheets, formulas |

### Scheduled Exports

Automated export capabilities:

- **Daily summaries**: Email delivery
- **Weekly reports**: Dashboard exports
- **Monthly billing**: Cost breakdowns

### External Tool Integration

- **Webhook support**: Real-time data streaming
- **API endpoints**: Direct integration
- **SDK availability**: Python, JavaScript, Go

**Section sources**
- [route.ts:700-1000](file://src/app/api/analytics/route.ts#L700-L1000)

## Troubleshooting Guide

### Common Issues

#### Authentication Errors
- **Issue**: 401 Unauthorized responses
- **Solution**: Verify JWT token validity and expiration
- **Debug**: Check token payload and signature

#### Query Performance Issues
- **Issue**: Slow query responses
- **Solution**: Optimize date ranges and reduce result sets
- **Debug**: Enable query profiling and check execution plans

#### Data Discrepancies
- **Issue**: Missing or incorrect metrics
- **Solution**: Verify data ingestion pipeline and aggregation logic
- **Debug**: Check raw usage events and aggregation logs

### Monitoring and Alerts

#### Key Metrics to Monitor
- **API response times**: Alert if >1s average
- **Cache hit rates**: Alert if <80%
- **Error rates**: Alert if >1%
- **Data freshness**: Alert if >5min stale

#### Log Analysis

Enable detailed logging for troubleshooting:

```bash
# Enable debug logging
export LOG_LEVEL=debug

# View analytics API logs
tail -f /var/log/analytics-api.log
```

**Section sources**
- [route.ts:800-1000](file://src/app/api/analytics/route.ts#L800-L1000)

## Conclusion

The Analytics API provides a comprehensive solution for monitoring and analyzing AI model usage across multiple providers. With its robust caching strategies, flexible query parameters, and detailed response schemas, it enables organizations to optimize costs, monitor performance, and gain insights into their AI infrastructure usage.

The system's design prioritizes both performance and scalability, handling high volumes of usage data while maintaining responsive query times. The extensive export capabilities and privacy controls ensure compliance with various regulatory requirements while providing flexibility for external reporting tools.

For optimal results, implement proper authentication, use appropriate query filters, and leverage the caching mechanisms for frequently accessed data. Regular monitoring and alerting will help maintain system health and identify potential issues proactively.