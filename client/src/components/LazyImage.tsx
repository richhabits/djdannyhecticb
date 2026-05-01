import { ImgHTMLAttributes } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  srcSet?: string;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  srcSet,
  sizes,
  className,
  ...props
}: LazyImageProps) {
  const { ref, isLoaded } = useLazyLoad<HTMLImageElement>();

  return (
    <div className="relative overflow-hidden bg-gray-800 rounded-lg">
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}
      <img
        ref={ref}
        src={isLoaded ? src : placeholder}
        srcSet={isLoaded ? srcSet : undefined}
        sizes={isLoaded ? sizes : undefined}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className || ''}`}
        {...props}
      />
    </div>
  );
}

// Picture element for WebP with fallback
interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  placeholder?: string;
  sources?: Array<{
    type: string;
    srcSet: string;
    sizes?: string;
  }>;
}

export function ResponsiveImage({
  src,
  alt,
  webpSrc,
  placeholder,
  sources,
  className,
  ...props
}: ResponsiveImageProps) {
  const { ref, isLoaded } = useLazyLoad<HTMLImageElement>();

  return (
    <div className="relative overflow-hidden bg-gray-800 rounded-lg">
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}
      <picture>
        {isLoaded && webpSrc && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        {isLoaded && sources && sources.map((source, idx) => (
          <source
            key={idx}
            srcSet={source.srcSet}
            type={source.type}
            sizes={source.sizes}
          />
        ))}
        <img
          ref={ref}
          src={isLoaded ? src : placeholder}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className || ''}`}
          {...props}
        />
      </picture>
    </div>
  );
}

// Image with blur-up effect
interface BlurUpImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurHash?: string;
  placeholder?: string;
}

export function BlurUpImage({
  src,
  alt,
  placeholder,
  className,
  ...props
}: BlurUpImageProps) {
  const { ref, isLoaded } = useLazyLoad<HTMLImageElement>();

  return (
    <div
      className={`relative overflow-hidden bg-gray-900 rounded-lg ${className || ''}`}
    >
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}
      <img
        ref={ref}
        src={isLoaded ? src : placeholder}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        }`}
        {...props}
      />
    </div>
  );
}
