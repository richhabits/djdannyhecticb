import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedCallback, useThrottledCallback } from "./usePersistFn";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 300 });
    expect(result.current).toBe("initial"); // Still old value

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("initial"); // Still old value

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("updated"); // Now updated
  });

  it("should reset timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 300 } }
    );

    rerender({ value: "b", delay: 300 });
    act(() => vi.advanceTimersByTime(200));
    
    rerender({ value: "c", delay: 300 });
    act(() => vi.advanceTimersByTime(200));
    
    expect(result.current).toBe("a"); // Timer keeps resetting

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("c"); // Final value after delay
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce callback execution", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current("arg1");
    result.current("arg2");
    result.current("arg3");

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg3");
  });

  it("should call callback with latest arguments", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    result.current("first", 1);
    act(() => vi.advanceTimersByTime(50));
    
    result.current("second", 2);
    act(() => vi.advanceTimersByTime(50));
    
    result.current("third", 3);
    act(() => vi.advanceTimersByTime(100));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("third", 3);
  });
});

describe("useThrottledCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should execute immediately on first call", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 300));

    result.current("arg1");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg1");
  });

  it("should throttle subsequent calls", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 300));

    result.current("arg1");
    result.current("arg2");
    result.current("arg3");

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should call with the last argument after throttle period
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith("arg3");
  });

  it("should allow new calls after throttle interval", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 300));

    result.current("first");
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    result.current("second");
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
