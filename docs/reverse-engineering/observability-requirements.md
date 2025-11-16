# Observability Requirements: StackShift

**Date:** 2025-11-16  
**Version:** 1.0.0  
**Route:** Brownfield (Tech-Prescriptive)

---

## Current State

### Logging
- **Application Logs:** stdout/stderr (console.log, console.error)
- **MCP Protocol:** Standard MCP logging format
- **Test Logs:** Vitest output
- **Build Logs:** TypeScript compiler output

**Location:** Terminal output (not persisted)  
**Retention:** None (ephemeral)  
**Structure:** Unstructured text

---

### Monitoring
- **Current Tools:** None configured
- **Metrics Tracked:** None
- **Alerting:** None
- **Dashboards:** None

---

### Error Tracking
- **Current:** Try-catch blocks with console.error
- **Error Reporting:** None (errors logged to console only)
- **Stack Traces:** Yes (in development)
- **Error Aggregation:** None

---

## Required Additions

### Business Metrics

**Workflow Progress:**
- Gear completions (how many projects complete each gear?)
- Route selection distribution (greenfield vs brownfield%)
- Cruise control adoption rate
- Average workflow completion time

**Usage Patterns:**
- Tool invocation frequency
- Most common clarifications
- Implementation scope preferences (none/p0/p0_p1/all)
- Feature implementation success rate

**Quality Metrics:**
- Spec coverage (% of code covered by specs)
- Gap analysis completion (% of gaps filled)
- Test coverage trends
- Documentation quality scores

---

### Technical Metrics

**Performance:**
- Tool execution time (analyze, reverse-engineer, etc.)
- File I/O operation latency
- State file read/write time
- Temp file cleanup success rate

**Reliability:**
- Tool success/failure rates
- State corruption incidents
- Atomic write failures
- Validation errors (input rejection rate)

**Security:**
- Path traversal attempts blocked
- Command injection attempts blocked
- Invalid route attempts
- Clarification limit violations

**Resource Usage:**
- Files processed per scan
- Directory depth reached
- Memory usage
- CPU usage

---

## Logging Strategy

### Structured Logging (Recommended)

**Library:** pino (for Node.js)

```bash
npm install pino
```

**Implementation:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Usage
logger.info({ tool: 'analyze', directory: '/path' }, 'Starting analysis');
logger.error({ err, tool: 'analyze' }, 'Analysis failed');
```

**Log Levels:**
- **error**: Failures, exceptions
- **warn**: Validation rejections, deprecated usage
- **info**: Tool starts/completions, state changes
- **debug**: Detailed execution flow
- **trace**: Verbose (development only)

**Log Fields:**
```json
{
  "level": "info",
  "time": 1700000000000,
  "tool": "analyze",
  "directory": "/path/to/project",
  "route": "brownfield",
  "duration": 1234,
  "msg": "Analysis complete"
}
```

---

### Event Logging

**Key Events to Log:**

**Workflow Events:**
- Gear started (tool, directory, route)
- Gear completed (tool, duration, output)
- Gear failed (tool, error, stack trace)
- State updated (changes made)

**Security Events:**
- Path traversal blocked (attempted path)
- Command injection blocked (attempted command)
- Invalid route rejected (value provided)
- Validation failure (field, reason)

**Performance Events:**
- Files processed (count, duration)
- State file operations (read/write time)
- Skill loading (skill name, found/fallback)

---

## Monitoring Strategy

### Option 1: Application Performance Monitoring (APM)

**Recommended Tools:**
- **Sentry:** Error tracking + performance
- **Datadog:** Full observability (metrics + logs + traces)
- **New Relic:** APM + infrastructure monitoring

**Implementation (Sentry Example):**
```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,  // 10% of transactions
});

// Track tool execution
const transaction = Sentry.startTransaction({ name: 'stackshift_analyze' });
try {
  await analyzeToolHandler(args);
  transaction.setStatus('ok');
} catch (error) {
  Sentry.captureException(error);
  transaction.setStatus('internal_error');
} finally {
  transaction.finish();
}
```

---

### Option 2: Custom Metrics (OpenTelemetry)

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node
```

**Metrics to Track:**
- `stackshift.tool.duration` (histogram)
- `stackshift.tool.invocations` (counter)
- `stackshift.tool.errors` (counter)
- `stackshift.state.size` (gauge)
- `stackshift.files.processed` (counter)

---

## Alerting Strategy

### Critical Alerts (P0)
- State file corruption detected
- Security validation failure rate >1%
- Tool failure rate >5%
- Atomic write failures

### Warning Alerts (P1)
- Test coverage drops below 80%
- npm audit shows vulnerabilities
- Average tool duration >10x baseline
- Error rate >1%

### Info Alerts (P2)
- New version available
- Dependency updates available
- Workflow completion milestones

---

## Debugging Capabilities

### Current Capabilities
- ✅ TypeScript source maps (debugging in VS Code)
- ✅ Stack traces on errors
- ✅ State file inspection (JSON)
- ✅ Test output (Vitest)

### Recommended Additions
- **Debug Mode:** `LOG_LEVEL=debug stackshift-mcp`
- **Trace Mode:** `LOG_LEVEL=trace stackshift-mcp`
- **State Snapshots:** Save state before/after each operation
- **Request/Response Logging:** Log all MCP requests/responses

---

## Dashboard Requirements

### Workflow Dashboard
**Metrics:**
- Total workflows started
- Workflows completed (by gear)
- Average completion time
- Success rate by gear
- Route distribution (greenfield/brownfield)

**Visualizations:**
- Funnel chart (gear completions)
- Time series (workflows over time)
- Pie chart (route selection)

---

### Performance Dashboard
**Metrics:**
- P50/P95/P99 tool execution time
- Files processed per second
- State file read/write latency
- Memory usage over time

**Visualizations:**
- Latency histogram
- Time series (performance trends)
- Resource usage gauges

---

### Security Dashboard
**Metrics:**
- Blocked path traversal attempts
- Blocked command injection attempts
- Validation failures by type
- Input sanitization events

**Visualizations:**
- Security event timeline
- Attack vector breakdown
- Validation failure distribution

---

## Implementation Plan

### Phase 1: Logging (Week 1)
1. Install pino
2. Add structured logging to all tools
3. Configure log levels
4. Add security event logging

### Phase 2: Error Tracking (Week 2)
1. Set up Sentry account
2. Install @sentry/node
3. Add error capture to all tools
4. Test error reporting

### Phase 3: Metrics (Week 3)
1. Install OpenTelemetry
2. Add custom metrics
3. Export to monitoring backend
4. Create dashboards

### Phase 4: Alerting (Week 4)
1. Define alert rules
2. Configure notification channels
3. Set up on-call rotation
4. Test alert delivery

---

## Testing Observability

### Log Testing
```typescript
// Test that security events are logged
it('logs path traversal attempts', async () => {
  const logs = captureLogs();
  await expect(analyzeToolHandler({ directory: '../../../etc' })).rejects.toThrow();
  expect(logs).toContainEqual(
    expect.objectContaining({
      level: 'warn',
      event: 'path_traversal_blocked',
    })
  );
});
```

### Metrics Testing
```typescript
// Test that metrics are recorded
it('records tool duration', async () => {
  await analyzeToolHandler({ directory: testDir });
  const metric = getMetric('stackshift.tool.duration');
  expect(metric.count).toBeGreaterThan(0);
});
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-16
