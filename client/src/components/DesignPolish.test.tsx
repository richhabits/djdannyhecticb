import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/test-utils";
import userEvent from "@testing-library/user-event";
import {
  CardSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  AnimatedGradientBg,
  GlassCard,
  GradientCard,
  ShimmerButton,
  PulseButton,
  FadeInOnScroll,
  TiltCard,
  GradientText,
  AnimatedText,
  GlowDivider,
  WaveDivider,
} from "./DesignPolish";

describe("Skeleton Components", () => {
  it("should render CardSkeleton", () => {
    const { container } = render(<CardSkeleton />);
    // CardSkeleton is a Card that contains animated pulse elements
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render ListItemSkeleton", () => {
    const { container } = render(<ListItemSkeleton />);
    // ListItemSkeleton contains animated pulse elements
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render GridSkeleton with custom count", () => {
    const { container } = render(<GridSkeleton count={4} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render GridSkeleton with default count", () => {
    const { container } = render(<GridSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("Loading Components", () => {
  it("should render LoadingSpinner with default size", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render LoadingSpinner with custom size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render LoadingDots", () => {
    const { container } = render(<LoadingDots />);
    // LoadingDots may use div or span elements
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render LoadingPulse", () => {
    const { container } = render(<LoadingPulse />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("Background Components", () => {
  it("should render AnimatedGradientBg", () => {
    const { container } = render(
      <AnimatedGradientBg>
        <div>Content</div>
      </AnimatedGradientBg>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render AnimatedGradientBg with children", () => {
    render(
      <AnimatedGradientBg>
        <span>Test Child</span>
      </AnimatedGradientBg>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});

describe("Card Components", () => {
  it("should render GlassCard", () => {
    render(<GlassCard>Glass Content</GlassCard>);
    expect(screen.getByText("Glass Content")).toBeInTheDocument();
  });

  it("should render GlassCard with custom className", () => {
    const { container } = render(
      <GlassCard className="custom-class">Content</GlassCard>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should render GradientCard", () => {
    render(<GradientCard>Gradient Content</GradientCard>);
    expect(screen.getByText("Gradient Content")).toBeInTheDocument();
  });
});

describe("Button Components", () => {
  it("should render ShimmerButton", () => {
    render(<ShimmerButton>Click Me</ShimmerButton>);
    expect(screen.getByRole("button")).toHaveTextContent("Click Me");
  });

  it("should render ShimmerButton with onClick handler", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ShimmerButton onClick={handleClick}>Click</ShimmerButton>);
    
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("should render PulseButton", () => {
    render(<PulseButton>Pulse</PulseButton>);
    expect(screen.getByRole("button")).toHaveTextContent("Pulse");
  });

  it("should render PulseButton with custom variant", () => {
    render(<PulseButton variant="outline">Outline</PulseButton>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

describe("Animation Components", () => {
  it("should render FadeInOnScroll", () => {
    render(
      <FadeInOnScroll>
        <div>Fade Content</div>
      </FadeInOnScroll>
    );
    expect(screen.getByText("Fade Content")).toBeInTheDocument();
  });

  it("should render FadeInOnScroll with custom delay", () => {
    render(
      <FadeInOnScroll delay={0.5}>
        <div>Delayed Content</div>
      </FadeInOnScroll>
    );
    expect(screen.getByText("Delayed Content")).toBeInTheDocument();
  });

  it("should render TiltCard", () => {
    render(
      <TiltCard>
        <div>Tilt Content</div>
      </TiltCard>
    );
    expect(screen.getByText("Tilt Content")).toBeInTheDocument();
  });

  it("should handle mouse events on TiltCard", () => {
    const { container } = render(
      <TiltCard>
        <div>Tilt Content</div>
      </TiltCard>
    );
    
    const card = container.firstChild as HTMLElement;
    
    // Simulate mouse enter
    fireEvent.mouseEnter(card);
    
    // Simulate mouse move
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
    
    // Simulate mouse leave
    fireEvent.mouseLeave(card);
    
    expect(screen.getByText("Tilt Content")).toBeInTheDocument();
  });
});

describe("Typography Components", () => {
  it("should render GradientText", () => {
    render(<GradientText>Gradient Title</GradientText>);
    expect(screen.getByText("Gradient Title")).toBeInTheDocument();
  });

  it("should render GradientText with custom className", () => {
    const { container } = render(
      <GradientText className="text-4xl">Large Text</GradientText>
    );
    expect(container.firstChild).toHaveClass("text-4xl");
  });

  it("should render AnimatedText", () => {
    const { container } = render(<AnimatedText>Animated Title</AnimatedText>);
    // AnimatedText splits text into individual characters
    expect(container.firstChild).toBeInTheDocument();
    // Check that individual characters are present
    const textContent = container.textContent || "";
    expect(textContent.replace(/\s+/g, " ").trim()).toBe("Animated Title");
  });

  it("should render AnimatedText with animation", () => {
    const { container } = render(<AnimatedText>Typing Text</AnimatedText>);
    expect(container.firstChild).toBeInTheDocument();
    const textContent = container.textContent || "";
    expect(textContent.replace(/\s+/g, " ").trim()).toBe("Typing Text");
  });
});

describe("Divider Components", () => {
  it("should render GlowDivider", () => {
    const { container } = render(<GlowDivider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render GlowDivider with custom color", () => {
    const { container } = render(<GlowDivider color="blue" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render WaveDivider", () => {
    const { container } = render(<WaveDivider />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should render WaveDivider with flip", () => {
    const { container } = render(<WaveDivider flip />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
