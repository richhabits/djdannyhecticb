/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Circuit Breaker Service
 * Industry-standard circuit breaker pattern for external service calls
 * Prevents cascading failures and provides fallback mechanisms
 */

export enum CircuitState {
    CLOSED = "CLOSED", // Normal operation
    OPEN = "OPEN", // Failing, reject requests immediately
    HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

export interface CircuitBreakerOptions {
    failureThreshold: number; // Number of failures before opening
    resetTimeout: number; // Time (ms) before attempting half-open
    successThreshold: number; // Successes needed in half-open to close
    timeout: number; // Request timeout (ms)
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount: number = 0;
    private successCount: number = 0;
    private lastFailureTime: number = 0;
    private options: CircuitBreakerOptions;

    constructor(
        private name: string,
        options: Partial<CircuitBreakerOptions> = {}
    ) {
        this.options = {
            failureThreshold: options.failureThreshold || 5,
            resetTimeout: options.resetTimeout || 60000, // 1 minute
            successThreshold: options.successThreshold || 2,
            timeout: options.timeout || 10000, // 10 seconds
        };
    }

    /**
     * Execute function with circuit breaker protection
     */
    async execute<T>(
        fn: () => Promise<T>,
        fallback?: () => Promise<T> | T
    ): Promise<T> {
        // Check if circuit is open
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
                // Transition to half-open
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
                console.log(`[CircuitBreaker] ${this.name}: OPEN → HALF_OPEN`);
            } else {
                // Still open, use fallback or throw
                console.warn(`[CircuitBreaker] ${this.name}: OPEN, rejecting request`);
                if (fallback) {
                    return await Promise.resolve(fallback());
                }
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }
        }

        try {
            // Execute with timeout
            const result = await Promise.race([
                fn(),
                new Promise<T>((_, reject) =>
                    setTimeout(
                        () => reject(new Error(`Circuit breaker ${this.name}: Timeout`)),
                        this.options.timeout
                    )
                ),
            ]);

            // Success
            this.onSuccess();
            return result;
        } catch (error) {
            // Failure
            this.onFailure();

            // Use fallback if available
            if (fallback) {
                console.warn(`[CircuitBreaker] ${this.name}: Using fallback after failure:`,
                    error instanceof Error ? error.message : String(error));
                return await Promise.resolve(fallback());
            }

            throw error;
        }
    }

    private onSuccess() {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.options.successThreshold) {
                this.state = CircuitState.CLOSED;
                console.log(`[CircuitBreaker] ${this.name}: HALF_OPEN → CLOSED`);
            }
        }
    }

    private onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            // Failed in half-open, go back to open
            this.state = CircuitState.OPEN;
            this.successCount = 0;
            console.warn(`[CircuitBreaker] ${this.name}: HALF_OPEN → OPEN`);
        } else if (
            this.state === CircuitState.CLOSED &&
            this.failureCount >= this.options.failureThreshold
        ) {
            // Too many failures, open circuit
            this.state = CircuitState.OPEN;
            console.error(`[CircuitBreaker] ${this.name}: CLOSED → OPEN (${this.failureCount} failures)`);
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

export class CircuitBreakerService {
    private breakers: Map<string, CircuitBreaker> = new Map();

    getBreaker(
        name: string,
        options?: Partial<CircuitBreakerOptions>
    ): CircuitBreaker {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(name, options));
        }
        return this.breakers.get(name)!;
    }

    getStatus() {
        const status: Record<string, any> = {};
        this.breakers.forEach((breaker, name) => {
            status[name] = breaker.getMetrics();
        });
        return status;
    }
}

export const circuitBreakerService = new CircuitBreakerService();

// Pre-configured circuit breakers
export const stripeBreaker = circuitBreakerService.getBreaker("stripe", {
    failureThreshold: 5,
    resetTimeout: 60000,
    timeout: 15000,
});

export const geminiBreaker = circuitBreakerService.getBreaker("gemini", {
    failureThreshold: 3,
    resetTimeout: 30000,
    timeout: 30000,
});

export const s3Breaker = circuitBreakerService.getBreaker("s3", {
    failureThreshold: 10,
    resetTimeout: 30000,
    timeout: 5000,
});

export const socialProofBreaker = circuitBreakerService.getBreaker("social_proof", {
    failureThreshold: 5,
    resetTimeout: 60000,
    timeout: 2000, // Very tight timeout for social proof
});
