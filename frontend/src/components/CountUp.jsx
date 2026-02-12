import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({
  start = 0,
  end = 0,
  duration = 1.5, // seconds
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  locale = 'en-US',
  once = true,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const total = Math.max(0.1, duration) * 1000;
    let raf;

    const step = (now) => {
      const progress = Math.min((now - startTime) / total, 1);
      const eased = easeOutCubic(progress);
      const current = start + (end - start) * eased;
      setValue(current);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, start, end, duration]);

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
