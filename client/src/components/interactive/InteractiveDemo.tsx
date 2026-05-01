/**
 * Interactive Components Demo
 * Showcases all animation and state patterns
 */

import { useState } from 'react';
import {
  StateButton,
  StateInput,
  TransitionWrapper,
  HoverCard,
  TypingAnimation,
  CounterAnimation,
  CardListSkeleton,
  FloatingActionButton,
  StateTextarea,
} from './index';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useHoverState } from '@/hooks/useAnimationState';

export function InteractiveDemo() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { isHovered, handlers } = useHoverState();
  const loading = useLoadingState();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value.includes('@') ? '' : 'Invalid email');
  };

  const handleSubmit = async () => {
    await loading.execute(
      new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000);
      })
    );
  };

  return (
    <div className="space-y-2xl p-2xl">
      {/* Entrance Animations */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">
          Entrance Animations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="p-lg bg-dark-surface rounded-lg animate-slide-in-top">
            Slide In Top
          </div>
          <div className="p-lg bg-dark-surface rounded-lg animate-slide-in-right">
            Slide In Right
          </div>
          <div className="p-lg bg-dark-surface rounded-lg animate-slide-in-bottom">
            Slide In Bottom
          </div>
          <div className="p-lg bg-dark-surface rounded-lg animate-fade-in-scale">
            Fade In Scale
          </div>
        </div>
      </section>

      {/* Feedback Animations */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-fade-in">Feedback Animations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
          <div className="p-lg bg-dark-surface rounded-lg text-center animate-pulse-soft">
            Pulse
          </div>
          <div className="p-lg bg-dark-surface rounded-lg text-center animate-bounce-soft">
            Bounce
          </div>
          <div className="p-lg bg-dark-surface rounded-lg text-center animate-float">
            Float
          </div>
          <div className="p-lg bg-dark-surface rounded-lg text-center animate-spin">
            ⚙️
          </div>
        </div>
      </section>

      {/* Hover Effects */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Hover Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="p-lg bg-dark-surface rounded-lg hover-lift cursor-pointer">
            Hover to Lift
          </div>
          <div className="p-lg bg-dark-surface rounded-lg hover-glow cursor-pointer">
            Hover to Glow
          </div>
          <div className="p-lg bg-dark-surface rounded-lg hover-scale cursor-pointer">
            Hover to Scale
          </div>
        </div>
      </section>

      {/* Button States */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Button States</h2>
        <div className="flex flex-wrap gap-md">
          <StateButton>Primary Button</StateButton>
          <StateButton variant="secondary">Secondary Button</StateButton>
          <StateButton variant="danger">Danger Button</StateButton>
          <StateButton isLoading>Loading</StateButton>
          <StateButton isError errorText="Failed">
            With Error
          </StateButton>
          <StateButton isSuccess successText="Complete">
            Success
          </StateButton>
          <StateButton disabled>Disabled</StateButton>
          <StateButton
            onClick={handleSubmit}
            isLoading={loading.isLoading}
            isError={!!loading.error}
          >
            Async Action
          </StateButton>
        </div>
      </section>

      {/* Input States */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Input States</h2>
        <div className="max-w-md space-y-md">
          <StateInput
            label="Basic Input"
            placeholder="Enter text..."
            helpText="This is a help text"
          />
          <StateInput
            label="With Error"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            placeholder="your@email.com"
          />
          <StateInput label="With Icon" icon="📧" placeholder="Email address" />
          <StateInput label="Disabled" disabled value="Disabled input" />
          <StateTextarea
            label="Comment"
            placeholder="Enter your message..."
            charLimit={200}
            helpText="Share your thoughts"
          />
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Loading States</h2>
        <CardListSkeleton count={2} />
      </section>

      {/* Transition Effects */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Transitions</h2>
        <div className="flex gap-md">
          <StateButton onClick={() => setShowModal(!showModal)} variant="primary">
            Toggle Modal
          </StateButton>
        </div>

        <TransitionWrapper
          isVisible={showModal}
          animateIn="fade-scale"
          animateOut="fade-scale"
        >
          <div className="p-lg bg-dark-surface rounded-lg border border-border-primary max-w-md">
            <h3 className="text-lg font-semibold mb-md">Modal Content</h3>
            <p className="mb-md">This modal smoothly transitions in and out.</p>
            <StateButton onClick={() => setShowModal(false)} variant="secondary">
              Close Modal
            </StateButton>
          </div>
        </TransitionWrapper>
      </section>

      {/* Typing Animation */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold">
          <TypingAnimation
            text="Typing Animation Example"
            speed={100}
            cursor
          />
        </h2>
      </section>

      {/* Counter Animation */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Counter Animations</h2>
        <div className="grid grid-cols-3 gap-lg max-w-lg">
          <div className="p-lg bg-dark-surface rounded-lg text-center">
            <div className="text-4xl font-bold text-accent-primary">
              <CounterAnimation target={1250000} duration={2000} />
            </div>
            <div className="text-sm text-text-secondary mt-md">Total Plays</div>
          </div>
          <div className="p-lg bg-dark-surface rounded-lg text-center">
            <div className="text-4xl font-bold text-accent-success">
              <CounterAnimation target={98} duration={1500} />%
            </div>
            <div className="text-sm text-text-secondary mt-md">Uptime</div>
          </div>
          <div className="p-lg bg-dark-surface rounded-lg text-center">
            <div className="text-4xl font-bold text-accent-warning">
              <CounterAnimation target={45} duration={2000} />
            </div>
            <div className="text-sm text-text-secondary mt-md">Concurrent</div>
          </div>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HoverCard scale lift className="p-lg bg-dark-surface rounded-lg">
            <h3 className="font-semibold mb-sm">Lift + Scale</h3>
            <p className="text-text-secondary">Hover to see both effects</p>
          </HoverCard>
          <HoverCard glow className="p-lg bg-dark-surface rounded-lg">
            <h3 className="font-semibold mb-sm">Glow Effect</h3>
            <p className="text-text-secondary">Hover to see the glow</p>
          </HoverCard>
        </div>
      </section>

      {/* Floating Action Button */}
      <section className="space-y-lg">
        <h2 className="text-2xl font-bold animate-slide-in-top">
          Floating Action Button
        </h2>
        <p className="text-text-secondary">Look at the bottom right corner →</p>
        <FloatingActionButton
          icon="⭐"
          label="Add to favorites"
          onClick={() => alert('Favorite added!')}
        />
      </section>

      {/* Reduced Motion Notice */}
      <div className="p-lg bg-dark-tertiary rounded-lg border border-border-primary">
        <h3 className="font-semibold mb-sm">♿ Accessibility</h3>
        <p className="text-sm text-text-secondary">
          All animations respect the <code className="bg-dark-surface px-sm py-xs rounded">
            prefers-reduced-motion
          </code>{' '}
          setting. If you have reduced motion enabled, animations will be instant.
        </p>
      </div>
    </div>
  );
}
