interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'text-base', md: 'text-2xl' };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`${sizes[size]} transition-transform ${readonly ? 'cursor-default' : 'hover:scale-125 cursor-pointer'}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}
