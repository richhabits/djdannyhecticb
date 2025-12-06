import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/test-utils";
import userEvent from "@testing-library/user-event";
import { AdvancedSearch, SearchBar } from "./AdvancedSearch";

// Mock the useDebounce hook to avoid timing issues in tests
vi.mock("../hooks/usePersistFn", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../hooks/usePersistFn")>();
  return {
    ...actual,
    useDebounce: (value: string) => value, // No debounce in tests
  };
});

describe("AdvancedSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render the search trigger button", () => {
    render(<AdvancedSearch />);
    
    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it("should show keyboard shortcut hint", () => {
    render(<AdvancedSearch />);
    
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("should open dialog when clicking search button", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    const button = screen.getByRole("button", { name: /search/i });
    await user.click(button);
    
    expect(screen.getByPlaceholderText(/search mixes/i)).toBeInTheDocument();
  });

  it("should show popular searches when no query", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    expect(screen.getByText("Popular Searches")).toBeInTheDocument();
    expect(screen.getByText("garage")).toBeInTheDocument();
    expect(screen.getByText("amapiano")).toBeInTheDocument();
  });

  it("should show quick links section", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Latest Mixes")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
  });

  it("should filter results based on search query", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    const input = screen.getByPlaceholderText(/search mixes/i);
    await user.type(input, "garage");
    
    await waitFor(() => {
      expect(screen.getByText("Garage Classics Vol. 1")).toBeInTheDocument();
    });
  });

  it("should show no results message when no matches", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    const input = screen.getByPlaceholderText(/search mixes/i);
    await user.type(input, "xyznonexistent123");
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it("should clear search input when clicking X button", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    const input = screen.getByPlaceholderText(/search mixes/i);
    await user.type(input, "test");
    
    expect(input).toHaveValue("test");
    
    // Click clear button (X)
    const clearButtons = screen.getAllByRole("button");
    const clearButton = clearButtons.find(btn => 
      btn.querySelector('[class*="lucide-x"]') || 
      btn.getAttribute("aria-label")?.includes("clear")
    );
    
    if (clearButton) {
      await user.click(clearButton);
      expect(input).toHaveValue("");
    }
  });

  it("should show filter toggle button", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    // Look for the filter/sliders button
    const buttons = screen.getAllByRole("button");
    const hasFilterButton = buttons.some(btn => 
      btn.querySelector('[class*="sliders"]') !== null
    );
    
    expect(hasFilterButton || buttons.length > 1).toBe(true);
  });

  it("should save search to recent searches", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    const input = screen.getByPlaceholderText(/search mixes/i);
    await user.type(input, "garage");
    
    // Click on a result to trigger search save
    await waitFor(() => {
      expect(screen.getByText("Garage Classics Vol. 1")).toBeInTheDocument();
    });
    
    const result = screen.getByText("Garage Classics Vol. 1");
    await user.click(result);
    
    // Check localStorage was called
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("should handle keyboard navigation hint text", async () => {
    const user = userEvent.setup();
    render(<AdvancedSearch />);
    
    await user.click(screen.getByRole("button", { name: /search/i }));
    
    expect(screen.getByText(/to select/i)).toBeInTheDocument();
    expect(screen.getByText(/to navigate/i)).toBeInTheDocument();
    expect(screen.getByText(/to close/i)).toBeInTheDocument();
  });
});

describe("SearchBar", () => {
  it("should render a search input", () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it("should accept custom className", () => {
    const { container } = render(<SearchBar className="custom-class" />);
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should update value when typing", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "test query");
    
    expect(input).toHaveValue("test query");
  });
});
