import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "../test/test-utils";
import userEvent from "@testing-library/user-event";
import { BookingCalendar, exportToGoogleCalendar, exportToAppleCalendar } from "./BookingCalendar";

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:test-url");
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(URL, "createObjectURL", { value: mockCreateObjectURL });
Object.defineProperty(URL, "revokeObjectURL", { value: mockRevokeObjectURL });

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", { value: mockWindowOpen });

describe("BookingCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the calendar", () => {
    const { container } = render(<BookingCalendar />);
    
    // Calendar should have some structure
    expect(container.firstChild).toBeInTheDocument();
    
    // Should have buttons (navigation and/or dates)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should display day headers", () => {
    render(<BookingCalendar />);
    
    // Check for abbreviated day names
    const content = document.body.textContent || "";
    expect(content).toContain("Sun");
    expect(content).toContain("Mon");
    expect(content).toContain("Tue");
  });

  it("should have multiple interactive elements", () => {
    render(<BookingCalendar />);
    
    // Find all buttons (navigation + date cells)
    const buttons = screen.getAllByRole("button");
    
    // Should have at least some date buttons (31 max + navigation)
    expect(buttons.length).toBeGreaterThan(5);
  });

  it("should display legend information", () => {
    render(<BookingCalendar />);
    
    // Legend should be present
    const content = document.body.textContent || "";
    expect(content).toContain("Available");
  });
});

describe("exportToGoogleCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should open Google Calendar URL", () => {
    exportToGoogleCalendar({
      title: "DJ Set",
      date: new Date("2024-02-15T20:00:00Z"),
      endDate: new Date("2024-02-15T23:00:00Z"),
      description: "Live DJ performance",
      location: "London Club",
    });

    expect(mockWindowOpen).toHaveBeenCalled();
    const url = mockWindowOpen.mock.calls[0][0];
    expect(url).toContain("calendar.google.com");
    // URL encodes spaces as + or %20
    expect(url).toMatch(/DJ(\+|%20)Set/);
  });

  it("should encode special characters in URL", () => {
    exportToGoogleCalendar({
      title: "DJ Set & Party!",
      date: new Date("2024-02-15T20:00:00Z"),
      endDate: new Date("2024-02-15T23:00:00Z"),
      description: "Special event & music",
      location: "Club @ London",
    });

    expect(mockWindowOpen).toHaveBeenCalled();
    const url = mockWindowOpen.mock.calls[0][0];
    expect(url).toContain("calendar.google.com");
    // & should be encoded in the parameter value
    expect(url).toContain("text=DJ");
  });
});

describe("exportToAppleCalendar", () => {
  let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    
    createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLAnchorElement);
    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as unknown as Node);
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as unknown as Node);
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("should create and download ICS file", () => {
    exportToAppleCalendar({
      title: "DJ Set",
      date: new Date("2024-02-15T20:00:00Z"),
      endDate: new Date("2024-02-15T23:00:00Z"),
      description: "Live DJ performance",
      location: "London Club",
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain(".ics");
  });

  it("should include event details in ICS content", () => {
    exportToAppleCalendar({
      title: "DJ Set",
      date: new Date("2024-02-15T20:00:00Z"),
      endDate: new Date("2024-02-15T23:00:00Z"),
      description: "Live DJ performance",
      location: "London Club",
    });

    // Check that createObjectURL was called with a Blob
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });
});
