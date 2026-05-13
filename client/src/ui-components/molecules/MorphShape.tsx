/**
 * MorphShape - Animated morphing background shapes
 *
 * Organic, fluid shapes that morph and animate. Great for decorative
 * backgrounds, loading indicators, and visual accents.
 */

export type MorphVariant = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
export type MorphSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MorphAnimation = 'morph' | 'morph-pulse' | 'float' | 'bob';

export interface MorphShapeProps {
  variant?: MorphVariant;
  size?: MorphSize;
  animation?: MorphAnimation;
  className?: string;
  /** Additional style overrides */
  style?: React.CSSProperties;
  /** If true, element won't interfere with clicks */
  pointerEvents?: boolean;
}

const sizeMap: Record<MorphSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

const colorMap: Record<MorphVariant, string> = {
  accent: 'from-red-500 to-pink-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-yellow-500 to-orange-500',
  danger: 'from-red-600 to-rose-600',
  info: 'from-blue-500 to-cyan-500',
  primary: 'from-purple-500 to-pink-500',
};

const animationMap: Record<MorphAnimation, string> = {
  morph: 'animate-morph',
  'morph-pulse': 'animate-morph-pulse',
  float: 'animate-float',
  bob: 'animate-bob',
};

/**
 * MorphShape Component
 *
 * @example
 * ```tsx
 * <MorphShape variant="accent" size="md" animation="morph" />
 * ```
 */
export function MorphShape({
  variant = 'accent',
  size = 'md',
  animation = 'morph',
  className = '',
  style,
  pointerEvents = false,
}: MorphShapeProps) {
  return (
    <div
      className={`
        bg-gradient-to-r ${colorMap[variant]}
        ${sizeMap[size]}
        ${animationMap[animation]}
        opacity-20
        ${pointerEvents ? '' : 'pointer-events-none'}
        ${className}
      `}
      style={{
        ...style,
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * MorphShapeGroup - Multiple morphing shapes in a composition
 *
 * Creates a layered, organic background effect with multiple
 * overlapping morphing shapes.
 *
 * @example
 * ```tsx
 * <MorphShapeGroup
 *   shapes={[
 *     { variant: 'accent', size: 'lg', animation: 'morph' },
 *     { variant: 'warning', size: 'md', animation: 'float' },
 *     { variant: 'success', size: 'sm', animation: 'bob' },
 *   ]}
 * />
 * ```
 */
export interface MorphShapeGroupProps {
  shapes: MorphShapeProps[];
  className?: string;
}

export function MorphShapeGroup({
  shapes,
  className = '',
}: MorphShapeGroupProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {shapes.map((shapeProps, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${Math.random() * 40}%`,
            left: `${Math.random() * 40}%`,
            zIndex: index,
          }}
        >
          <MorphShape {...shapeProps} />
        </div>
      ))}
    </div>
  );
}

/**
 * FloatingShapeBackground - Full-screen morphing shape background
 *
 * Perfect for page backgrounds, headers, or full-viewport decorations.
 *
 * @example
 * ```tsx
 * <FloatingShapeBackground variant="primary" intensity="medium" />
 * ```
 */
export interface FloatingShapeBackgroundProps {
  variant?: MorphVariant;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export function FloatingShapeBackground({
  variant = 'primary',
  intensity = 'medium',
  className = '',
}: FloatingShapeBackgroundProps) {
  const shapeCount = intensity === 'light' ? 2 : intensity === 'medium' ? 3 : 5;
  const baseOpacity =
    intensity === 'light' ? 0.08 : intensity === 'medium' ? 0.12 : 0.18;

  const shapes = Array.from({ length: shapeCount }).map((_, i) => ({
    variant: (
      [
        'accent',
        'success',
        'warning',
        'danger',
        'info',
        'primary',
      ] as MorphVariant[]
    )[i % 6],
    size: (['lg', 'xl', 'md'] as MorphSize[])[i % 3],
    animation: (
      ['morph', 'morph-pulse', 'float', 'bob'] as MorphAnimation[]
    )[i % 4],
  }));

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ filter: 'blur(40px)' }}
    >
      {shapes.map((shapeProps, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${Math.sin(index) * 30 + 20}%`,
            left: `${Math.cos(index) * 30 + 20}%`,
            opacity: baseOpacity,
            zIndex: index,
          }}
        >
          <MorphShape {...shapeProps} pointerEvents={false} />
        </div>
      ))}
    </div>
  );
}

/**
 * PulsingMorphShape - Morph shape with pulsing effect
 *
 * Combines morphing with pulsing scale for attention-grabbing elements.
 *
 * @example
 * ```tsx
 * <PulsingMorphShape variant="accent" size="md" />
 * ```
 */
export function PulsingMorphShape({
  variant = 'accent',
  size = 'md',
  className = '',
}: Omit<MorphShapeProps, 'animation'>) {
  return (
    <div className={`relative ${className}`}>
      {/* Background pulse glow */}
      <div
        className="absolute inset-0 bg-gradient-to-r animate-pulse-glow"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        }}
      />

      {/* Main morphing shape */}
      <MorphShape
        variant={variant}
        size={size}
        animation="morph-pulse"
        pointerEvents={false}
      />
    </div>
  );
}
