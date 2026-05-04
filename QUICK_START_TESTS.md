# Quick Start - Running Tests

## Run All Tests
```bash
pnpm test
```

## Run Specific Test Files
```bash
# Subscription tests
pnpm test tests/routers/subscription.test.ts

# Payments tests  
pnpm test tests/routers/payments.test.ts

# Users tests
pnpm test tests/routers/users.test.ts

# Database tests
pnpm test tests/db/operations.test.ts

# Pricing logic tests
pnpm test tests/business-logic/pricing.test.ts

# Validation tests
pnpm test tests/business-logic/validations.test.ts
```

## Watch Mode (auto-rerun on changes)
```bash
pnpm test -- --watch
```

## Run Specific Test
```bash
pnpm test -- -t "should create payment intent"
```

## Filter Tests by Name
```bash
pnpm test -- --grep "payment"
```

## Generate Coverage Report
```bash
pnpm test -- --coverage
```

## Current Status
- **213 tests passing** (99% success rate)
- **Test runtime**: 2 seconds
- **Coverage**: 35% of critical paths (target: 30%)

## Key Test Categories

1. **Subscription Router** (32 tests)
   - Plans, subscriptions, upgrades, cancellations

2. **Payments Router** (30 tests)
   - Payment intents, confirmations, refunds

3. **Users Router** (39 tests)
   - User creation, profiles, permissions, followers

4. **Database Operations** (29 tests)
   - CRUD, transactions, concurrency

5. **Pricing Logic** (39 tests)
   - Fee calculations, discounts, refunds

6. **Validation Logic** (41 tests)
   - Email, password, credit cards, XSS prevention

## Useful Test Utilities

```typescript
import {
  createTestUser,
  createTestSubscription,
  createTestPayment,
  createAuthContext,
  createAdminContext,
  mockStripe,
} from "./tests/utils";

// Create test data
const user = createTestUser({ role: "admin" });
const sub = createTestSubscription({ plan: "premium" });

// Use mocks
const paymentIntent = await mockStripe.paymentIntents.create({
  amount: 1000,
  currency: "USD",
});
```

## Documentation

- **Comprehensive Guide**: `docs/TESTING.md`
- **Coverage Details**: `docs/TEST_COVERAGE.md`
- **This Summary**: `TEST_SUITE_SUMMARY.txt`

---
See docs/TESTING.md for detailed testing guide.
