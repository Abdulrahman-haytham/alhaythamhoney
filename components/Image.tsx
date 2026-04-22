import React from 'react';

type FetchPriority = 'high' | 'low' | 'auto';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'> & {
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: FetchPriority;
  fetchpriority?: FetchPriority;
  wrapperClassName?: string;
  placeholderClassName?: string;
  fadeIn?: boolean;
};

export function Image({
  loading,
  decoding = 'async',
  fetchPriority,
  fetchpriority,
  wrapperClassName,
  placeholderClassName = 'bg-zinc-800/40',
  fadeIn = true,
  ...rest
}: ImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const resolvedFetchPriority = fetchpriority ?? fetchPriority;
  const resolvedLoading = loading ?? (resolvedFetchPriority === 'high' ? 'eager' : 'lazy');

  const { className, onLoad, onError, ...imgRest } = rest;

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  const imgProps: Record<string, unknown> = {
    ...imgRest,
    loading: resolvedLoading,
    decoding,
    ref: imgRef,
    onLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      onLoad?.(e);
    },
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      onError?.(e);
    }
  };

  if (resolvedFetchPriority) {
    imgProps.fetchpriority = resolvedFetchPriority;
  }

  if (!wrapperClassName) {
    return React.createElement('img', { ...imgProps, className });
  }

  const imgClassName = [
    className,
    fadeIn ? 'transition-opacity duration-500 ease-out' : null,
    fadeIn ? (isLoaded ? 'opacity-100' : 'opacity-0') : null
  ]
    .filter(Boolean)
    .join(' ');

  const placeholderOverlayClassName = [
    'absolute inset-0 transition-opacity duration-500 ease-out',
    placeholderClassName,
    isLoaded ? 'opacity-0' : 'opacity-100'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['relative overflow-hidden', wrapperClassName].filter(Boolean).join(' ')}>
      <div aria-hidden className={placeholderOverlayClassName} />
      {React.createElement('img', { ...imgProps, className: imgClassName })}
    </div>
  );
}

