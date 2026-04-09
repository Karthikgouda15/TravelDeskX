// src/components/FareCalendar.jsx
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

/**
 * Horizontal scrollable fare calendar strip.
 * Props:
 *  - priceTrend: Array<{ date: 'YYYY-MM-DD', minPrice: number }>
 *  - selectedDate: 'YYYY-MM-DD'
 *  - onSelectDate: fn(dateStr)
 *  - isLoading: boolean
 */
const FareCalendar = ({ priceTrend, selectedDate, onSelectDate, isLoading }) => {
  const scrollRef = useRef(null);

  // Always treat priceTrend as an array
  const safeTrend = Array.isArray(priceTrend) ? priceTrend : [];

  // Build next 14 days
  const today = new Date();
  const days = [];
  for (let i = 0; i < 14; i++) {
    try {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const match = safeTrend.find((p) => p && p.date === dateStr);
      const price = match && match.minPrice ? Number(match.minPrice) : null;
      days.push({
        dateStr,
        price,
        dayLabel: d.toLocaleDateString('en', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    } catch {
      // skip malformed date
    }
  }

  const prices = days.map((d) => d.price).filter((p) => p !== null && p > 0);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length && Math.max(...prices) !== minP ? Math.max(...prices) : minP + 1;

  const getBorderColor = (price, isSelected) => {
    if (isSelected) return 'border-white';
    if (!price) return 'border-white/10';
    const ratio = (price - minP) / (maxP - minP);
    if (ratio < 0.33) return 'border-white/40';
    if (ratio < 0.66) return 'border-white/20';
    return 'border-white/5';
  };

  const getBgColor = (price, isSelected) => {
    if (isSelected) return 'bg-white/10';
    if (!price) return 'bg-white/5';
    const ratio = (price - minP) / (maxP - minP);
    if (ratio < 0.33) return 'bg-white/5';
    if (ratio < 0.66) return 'bg-white/[0.03]';
    return 'bg-transparent';
  };

  const getTextColor = (price, isSelected) => {
    if (isSelected) return 'text-white';
    if (!price) return 'text-textMuted';
    const ratio = (price - minP) / (maxP - minP);
    if (ratio < 0.33) return 'text-white';
    if (ratio < 0.66) return 'text-white/60';
    return 'text-white/40';
  };

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 1000) return `₹${(p / 1000).toFixed(1)}k`;
    return `₹${p}`;
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden py-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-20 h-20 rounded-xl border border-white/10 bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative py-1">
      {/* Left scroll */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black border border-white/10 rounded-full hover:border-white transition-colors shadow-lg"
      >
        <ChevronLeft size={15} className="text-white" />
      </button>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const cheapest = day.price !== null && day.price === minP && prices.length > 1;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => {
                if (typeof onSelectDate === 'function') onSelectDate(day.dateStr);
              }}
              className={[
                'shrink-0 w-20 rounded-xl border transition-all relative overflow-hidden',
                'flex flex-col items-center justify-center gap-0.5 py-2',
                getBorderColor(day.price, isSelected),
                getBgColor(day.price, isSelected),
                isSelected ? 'shadow-[0_0_20px_rgba(0,212,200,0.25)]' : 'hover:brightness-125',
              ].join(' ')}
            >
              {day.isToday && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase text-accent tracking-widest">
                  Today
                </span>
              )}
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide mt-2">
                {day.dayLabel}
              </span>
              <span className={`text-lg font-mono font-black ${isSelected ? 'text-accent' : 'text-white'}`}>
                {day.dayNum}
              </span>
              <span className={`text-[9px] font-black ${getTextColor(day.price, isSelected)}`}>
                {formatPrice(day.price)}
              </span>
              {cheapest && (
                <Flame size={9} className="text-white absolute bottom-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll */}
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black border border-white/10 rounded-full hover:border-white transition-colors shadow-lg"
      >
        <ChevronRight size={15} className="text-white" />
      </button>
    </div>
  );
};

// Wrap in class-based error boundary so crashes don't kill the parent
class FareCalendarBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('[FareCalendar] Render error:', err?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex gap-2 overflow-hidden py-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shrink-0 w-20 h-16 rounded-xl border border-white/10 bg-white/5 opacity-40" />
          ))}
        </div>
      );
    }
    return <FareCalendar {...this.props} />;
  }
}

export default FareCalendarBoundary;
