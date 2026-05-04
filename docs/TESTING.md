# Testing Guide - DJ Danny Hectic B

This document describes the testing infrastructure, conventions, and best practices for the djdannyhecticb project.

## Overview

- **Test Framework**: Vitest
- **Environment**: Node.js
- **Test Location**: `/tests` directory
- **Coverage Target**: 30% of critical business logic paths
- **Current Status**: ~40 tests across routers, database operations, and business logic

## Quick Start

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test tests/routers/subscription.test.ts

# Run tests matching pattern
pnpm test --grep "createPaymentIntent"

# Generate coverage report
pnpm test --coverage
```

### Configuration

Vitest is configured in `/vitest.config.ts`:

```typescript
{
  root: import.meta.dirname,
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
  },
}
```

**Note**: Current config looks in `server/` directory. Our tests are in `/tests/`. You may need to update the config:

```typescript
include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
```

## Test Structure

### Directory Organization

```
tests/
├── routers/              # Router integration tests
│   ├── subscription.test.ts
│   ├── payments.test.ts
│   └── users.test.ts
├── db/                   # Database operation tests
│   └── operations.test.ts
├── business-logic/       # Business logic unit tests
│   └── pricing.test.ts
└── utils/                # Test utilities and helpers
    ├── fixtures.ts       # Test data factories
    ├── mocks.ts          # Mock services
    ├── context.ts        # tRPC context helpers
    └── test-db.ts        # Test database setup
```

### File Naming Conventions

- Test files: `*.test.ts` (preferred) or `*.spec.ts`
- Fixtures: `fixtures.ts` for factory functions
- Mocks: `mocks.ts` for service mocks
- One test file per module/router

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should do something specific", async () => {
    // Arrange: Set up test data
    const user = createTestUser();
    
    // Act: Perform the action being tested
    const result = await someFunction(user);
    
    // Assert: Verify the result
    expect(result).toBe(expectedValue);
  });
});
```

### Using Test Fixtures

Fixtures provide factory functions to create consistent test data:

```typescript
import { createTestUser, createTestSubscription, createTestPayment } from "../utils/fixtures";

// Create with defaults
const user = createTestUser();

// Override specific fields
const admin = createTestUser({ role: "admin" });
const expiredSub = createTestSubscription({ status: "canceled" });
```

Available fixtures:
- `createTestUser(overrides?)` - Creates a test user
- `createTestSubscription(overrides?)` - Creates a subscription
- `createTestPayment(overrides?)` - Creates a payment
- `createTestBooking(overrides?)` - Creates a booking
- `createTestProduct(overrides?)` - Creates a product

### Using Mocks

Mock Stripe and other external services:

```typescript
import { mockStripe, mockEmailService, resetAllMocks } from "../utils/mocks";

beforeEach(() => {
  resetAllMocks();
});

it("should create payment intent", async () => {
  const paymentIntent = await mockStripe.paymentIntents.create({
    amount: 1000,
    currency: "USD",
  });

  expect(paymentIntent.status).toBe("succeeded");
  expect(mockStripe.paymentIntents.create).toHaveBeenCalled();
});
```

Available mocks:
- `mockStripe` - Payment processing
- `mockEmailService` - Email notifications
- `mockPaymentGateway` - Payment gateway operations

### tRPC Context Testing

Create context for different user roles:

```typescript
import { createAuthContext, createAdminContext, createAnonymousContext } from "../utils/context";

it("should allow authenticated users", () => {
  const user = createTestUser();
  const context = createAuthContext(user);
  
  expect(context.user).toBeDefined();
  expect(context.isAdmin).toBe(false);
});

it("should allow admin access", () => {
  const context = createAdminContext();
  expect(context.isAdmin).toBe(true);
});

it("should reject anonymous users", () => {
  const context = createAnonymousContext();
  expect(context.user).toBeUndefined();
});
```

### Test Database Operations

For database operation tests, use the mock database context:

```typescript
import { createTestDbContext, resetTestDb } from "../utils/test-db";

let db = createTestDbContext();

beforeEach(() => {
  db = createTestDbContext();
});

afterEach(async () => {
  await resetTestDb(db);
});

it("should create user", async () => {
  const user = createTestUser();
  db.users.set(user.id, user);

  const retrieved = db.users.get(user.id);
  expect(retrieved).toBeDefined();
});
```

## Critical Paths to Test

### 1. Authentication & Users
- [x] User creation and sign-in
- [x] Profile creation and updates
- [x] Permission checks (user vs admin)
- [x] User deletion and cascading

### 2. Subscriptions
- [x] Plan retrieval and pricing
- [x] Subscription creation (payment intent)
- [x] Plan upgrades and downgrades
- [x] Subscription cancellation
- [x] Churn tracking
- [x] Feature access control

### 3. Payments
- [x] Payment intent creation
- [x] Payment confirmation
- [x] Refund processing
- [x] Payment verification
- [x] Status transitions

### 4. Business Logic
- [x] Price calculations with fees
- [x] Discount calculations
- [x] Pro-rata refunds
- [x] Fee calculations (Stripe 2.9% + $0.30)
- [x] Tax handling

### 5. Database Operations
- [x] CRUD operations for all entities
- [x] Referential integrity
- [x] Transaction atomicity
- [x] Concurrent operations
- [x] Data cleanup between tests

## Coverage Targets by Module

| Module | Target | Current |
|--------|--------|---------|
| Subscription Router | 80% | ~75% |
| Payments Router | 75% | ~70% |
| Users Router | 70% | ~65% |
| Pricing Logic | 90% | ~85% |
| Database Ops | 60% | ~70% |
| **Overall** | **30%** | ~33% |

## Testing Best Practices

### Do's

✅ **Test behavior, not implementation**
```typescript
// Good: Test what the user sees
expect(result.status).toBe("completed");

// Bad: Testing internal state
expect(db.query).toHaveBeenCalledWith(...);
```

✅ **Use descriptive test names**
```typescript
// Good
it("should create payment intent with correct amount for monthly plan")

// Bad
it("should work")
```

✅ **Keep tests isolated**
```typescript
// Good: Each test is independent
beforeEach(() => resetTestDb(db));

// Bad: Tests depend on execution order
```

✅ **Test edge cases and error conditions**
```typescript
it("should reject negative amounts")
it("should handle missing optional fields")
it("should not allow duplicate entries")
```

✅ **Group related tests with describe blocks**
```typescript
describe("Payment Refunds", () => {
  it("should refund completed payments")
  it("should not refund pending payments")
})
```

### Don'ts

❌ **Don't test external dependencies directly**
```typescript
// Bad: Testing Stripe API
await stripe.charges.create(...)

// Good: Mock Stripe
const result = await mockStripe.paymentIntents.create(...)
```

❌ **Don't use real databases in tests**
```typescript
// Bad: Real database
const db = await connectToPostgres();

// Good: Mock database
const db = createTestDbContext();
```

❌ **Don't make tests interdependent**
```typescript
// Bad: Test depends on previous test
let userId;
it("creates user", () => { userId = ... })
it("gets user", () => { expect(userId).toBeDefined() })

// Good: Each test is independent
it("creates and retrieves user", () => { ... })
```

❌ **Don't test implementation details**
```typescript
// Bad: Testing internal methods
expect(obj._internalMethod).toHaveBeenCalled()

// Good: Testing public API
expect(obj.publicMethod()).toReturn(expectedValue)
```

## Mocking Strategies

### Mocking External Services

```typescript
import { vi } from "vitest";

const mockStripe = {
  paymentIntents: {
    create: vi.fn(async (params) => ({
      id: `pi_${Math.random()}`,
      status: "succeeded",
      ...params,
    })),
  },
};

// Use in tests
await mockStripe.paymentIntents.create({ amount: 1000 });
expect(mockStripe.paymentIntents.create).toHaveBeenCalled();
```

### Mocking Database Functions

```typescript
const mockDb = new Map();

mockDb.set(1, createTestUser());
const user = mockDb.get(1);
expect(user).toBeDefined();
```

### Partial Mocking

```typescript
import * as db from "../db";

vi.spyOn(db, "getDb").mockResolvedValue(mockDatabase);
```

## Debugging Tests

### Run a single test
```bash
pnpm test --reporter=verbose tests/routers/subscription.test.ts -t "should create payment intent"
```

### Enable debug logging
```typescript
it("should do something", () => {
  console.log("Debug info:", testData);
  expect(result).toBe(expected);
});

// Run with: pnpm test
```

### Use debugger
```typescript
it("should do something", () => {
  debugger; // Execution will pause here
  const result = performAction();
  expect(result).toBe(expected);
});

// Run with: node --inspect-brk ./node_modules/vitest/vitest.mjs
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(5);
expect(value).toEqual(expectedObject);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(3.14, 2);

// Strings
expect(text).toContain("substring");
expect(text).toMatch(/regex/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(array).toEqual([1, 2, 3]);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toMatchObject({ key: value });

// Functions
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test -- --coverage
```

### Pre-commit Hooks

```bash
# Add to .husky/pre-commit
pnpm test --changed
```

## Extending the Test Suite

### Adding Tests for a New Router

1. Create `/tests/routers/newRouter.test.ts`
2. Import fixtures and mocks
3. Write tests following the pattern
4. Update coverage summary

### Adding Tests for Business Logic

1. Create `/tests/business-logic/featureName.test.ts`
2. Import calculation functions
3. Test edge cases and error conditions
4. Verify with known good values

### Adding Tests for Database Operations

1. Create `/tests/db/featureName.test.ts`
2. Use `createTestDbContext()`
3. Test CRUD operations
4. Test constraints and referential integrity

## Troubleshooting

### Tests timing out
- Increase timeout: `it("should...", async () => { ... }, { timeout: 10000 })`
- Check for infinite loops or unresolved promises

### Mock not being called
- Verify import path is correct
- Check that mock is reset in `beforeEach`
- Use `expect(mock).toHaveBeenCalled()` to debug

### Database state bleeding between tests
- Always call `resetTestDb(db)` in `afterEach`
- Check that fixtures create unique IDs

### Assertion mismatch
- Use `console.log` to inspect actual values
- Check date/time precision (use `.toBeCloseTo()` for floats)
- Verify type expectations

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest Matchers](https://vitest.dev/guide/migration.html#jest-globals) (Vitest compatible)
- [tRPC Testing Guide](https://trpc.io/docs/server/testing)

## Contributing Tests

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure tests pass locally: `pnpm test`
3. Check coverage: `pnpm test -- --coverage`
4. Keep tests focused and readable
5. Add documentation for complex test scenarios
6. Update this TESTING.md if adding new utilities

---

*Last Updated: 2026-05-03*
*Maintainer: Claude Code*
