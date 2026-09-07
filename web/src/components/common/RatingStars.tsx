import { IconStar } from '@/components/svg/Icons'

interface Props {
  value: number
  onSelect?: (v: number) => void
  interactive?: boolean
}

/** Rating display + input (chỉ bấm khi interactive=true) */
export function RatingStars({ value, onSelect, interactive = false }: Props) {
  return (
    <div className={`rating-input ${interactive ? 'is-interactive' : ''}`} role={interactive ? 'radiogroup' : undefined} aria-label="Đánh giá">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          disabled={!interactive}
          className={v <= value ? 'is-active' : ''}
          onClick={() => onSelect?.(v)}
          aria-label={`${v} sao`}
          aria-checked={interactive ? value === v : undefined}
          role={interactive ? 'radio' : undefined}
        >
          <IconStar size={interactive ? 26 : 16} fill={v <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}