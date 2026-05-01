import { useState } from 'react';
import { SwipeableCard, SwipeableDismissCard } from './SwipeableCard';
import { PageTransition, StaggeredTransition } from './PageTransition';
import {
  MorphShape,
  MorphShapeGroup,
  FloatingShapeBackground,
  PulsingMorphShape,
} from './MorphShape';
import { useIntersectionAnimation } from '@/hooks/useIntersectionAnimation';
import { useGestureSupport } from '@/hooks/useGestureSupport';

/**
 * InteractionDemo - Comprehensive showcase of all advanced interactions
 *
 * Demonstrates:
 * - Swipeable cards with dismiss functionality
 * - Page transitions
 * - Morphing shapes
 * - Floating animations
 * - Scroll-triggered animations
 * - Gesture detection
 */
export function InteractionDemo() {
  const [dismissedCards, setDismissedCards] = useState<number[]>([]);
  const [swipeLog, setSwipeLog] = useState<string>('');
  const { ref: intersectRef, isVisible } = useIntersectionAnimation();

  const handleDismiss = (id: number) => {
    setDismissedCards((prev) => [...prev, id]);
  };

  const addToLog = (message: string) => {
    setSwipeLog((prev) => {
      const newLog = `${message}\n${prev}`.split('\n').slice(0, 5).join('\n');
      return newLog;
    });
  };

  return (
    <PageTransition duration="base">
      <div className="space-y-12 p-4 md:p-8 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12">
          <FloatingShapeBackground variant="primary" intensity="medium" />

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-page-enter">
              Advanced Interactions
            </h1>
            <p className="text-lg text-slate-300 animate-fade-in-up">
              Swipe, tap, and interact with the components below. Mobile-optimized
              with smooth animations and accessibility support.
            </p>
          </div>
        </div>

        {/* Swipeable Cards Section */}
        <StaggeredTransition staggerDelay="md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Swipeable Cards</h2>
              <span className="text-sm text-slate-500">
                (Swipe left or long-press)
              </span>
            </div>

            {[1, 2, 3].map((id) => (
              <SwipeableDismissCard
                key={id}
                onDismiss={() => handleDismiss(id)}
                dismissDirection="left"
                showFeedback
                className={dismissedCards.includes(id) ? 'hidden' : ''}
              >
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white cursor-grab active:cursor-grabbing">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Interactive Card {id}
                      </h3>
                      <p className="text-purple-100">
                        Swipe left to dismiss or long-press for more options
                      </p>
                    </div>
                    <div className="text-3xl">👉</div>
                  </div>
                </div>
              </SwipeableDismissCard>
            ))}

            {dismissedCards.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                {dismissedCards.length} card{dismissedCards.length !== 1 ? 's' : ''}{' '}
                dismissed
              </div>
            )}
          </div>
        </StaggeredTransition>

        {/* Gesture Detection Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Gesture Detection</h2>
          <GestureDetectionBox onGesture={addToLog} />

          {swipeLog && (
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm text-green-400 max-h-40 overflow-y-auto">
              <div className="whitespace-pre-wrap">{swipeLog}</div>
            </div>
          )}
        </div>

        {/* Morphing Shapes Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Morphing Shapes</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 px-6 bg-slate-900 rounded-lg">
            <div className="flex items-center justify-center">
              <MorphShape variant="accent" size="md" animation="morph" />
            </div>
            <div className="flex items-center justify-center">
              <MorphShape variant="success" size="md" animation="float" />
            </div>
            <div className="flex items-center justify-center">
              <MorphShape variant="warning" size="md" animation="bob" />
            </div>
            <div className="flex items-center justify-center">
              <MorphShape variant="danger" size="md" animation="morph-pulse" />
            </div>
          </div>

          {/* Pulsing Shape */}
          <div className="flex justify-center py-12 bg-slate-900 rounded-lg">
            <PulsingMorphShape variant="info" size="lg" />
          </div>
        </div>

        {/* Floating Animations Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Floating Animations</h2>

          <div className="space-y-6 p-8 bg-slate-900 rounded-lg">
            <div className="animate-float text-center text-4xl">
              ✨ This floats ✨
            </div>
            <div className="animate-bob text-center text-4xl">
              🎯 This bobs
            </div>
            <div className="animate-float-small text-center text-4xl">
              🌟 This drifts
            </div>
          </div>
        </div>

        {/* Scroll-Triggered Animations Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Scroll-Triggered Animations</h2>
          <div
            ref={intersectRef as React.RefObject<HTMLDivElement>}
            className={`p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white transition-all duration-500 ${
              isVisible ? 'animate-page-enter opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              🎬 This appeared when scrolled into view
            </h3>
            <p>Scroll down to trigger the animation</p>
          </div>
        </div>

        {/* Advanced Features Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Advanced Features</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Bounce Animation */}
            <div className="p-6 bg-slate-900 rounded-lg text-center">
              <div className="animate-bounce-in text-4xl mb-2">🚀</div>
              <p className="font-semibold">Bounce In</p>
              <p className="text-sm text-slate-400">Scale entrance with bounce</p>
            </div>

            {/* Elastic Animation */}
            <div className="p-6 bg-slate-900 rounded-lg text-center">
              <div className="animate-elastic-x text-4xl mb-2">💪</div>
              <p className="font-semibold">Elastic Effect</p>
              <p className="text-sm text-slate-400">Squeeze and expand</p>
            </div>

            {/* Spin Animation */}
            <div className="p-6 bg-slate-900 rounded-lg text-center">
              <div className="animate-spin-fast text-4xl mb-2">⚡</div>
              <p className="font-semibold">Fast Spin</p>
              <p className="text-sm text-slate-400">Quick rotation</p>
            </div>

            {/* Wobble Animation */}
            <div className="p-6 bg-slate-900 rounded-lg text-center">
              <div className="animate-wobble text-4xl mb-2">🎪</div>
              <p className="font-semibold">Wobble</p>
              <p className="text-sm text-slate-400">Side-to-side shake</p>
            </div>
          </div>
        </div>

        {/* Code Example Section */}
        <div className="space-y-4 pb-8">
          <h2 className="text-2xl font-bold">Usage Example</h2>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono">
{`import { SwipeableCard } from '@/components/interactive/SwipeableCard';

export function MyCard() {
  return (
    <SwipeableCard
      onSwipeLeft={() => console.log('Swiped left')}
      onLongPress={() => console.log('Long pressed')}
      showFeedback
    >
      <div className="p-4 bg-purple-600 rounded-lg">
        Swipe me!
      </div>
    </SwipeableCard>
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/**
 * GestureDetectionBox - Interactive box to detect gestures
 */
interface GestureDetectionBoxProps {
  onGesture: (message: string) => void;
}

function GestureDetectionBox({ onGesture }: GestureDetectionBoxProps) {
  const ref = useGestureSupport({
    onSwipeLeft: () => onGesture('⬅️ Swiped left'),
    onSwipeRight: () => onGesture('➡️ Swiped right'),
    onSwipeUp: () => onGesture('⬆️ Swiped up'),
    onSwipeDown: () => onGesture('⬇️ Swiped down'),
    onLongPress: () => onGesture('👆 Long pressed'),
    onDoubleTap: () => onGesture('👆👆 Double tapped'),
  });

  // Workaround for ref return type
  const divRef = (ref as any)?.ref || { current: null };

  return (
    <div
      ref={divRef}
      className="min-h-32 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg p-6 flex items-center justify-center cursor-grab active:cursor-grabbing gesture-friendly touch-none"
      role="button"
      tabIndex={0}
      aria-label="Gesture detection area"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">👆</div>
        <p className="text-slate-400">Try swiping or tapping</p>
        <p className="text-sm text-slate-500 mt-2">
          Works on touch devices • Keyboard accessible
        </p>
      </div>
    </div>
  );
}
