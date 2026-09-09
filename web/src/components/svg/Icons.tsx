/* ============================================================
   CINEGA — Icon system (SVG tự vẽ, nét mảnh, consistent)
   KHÔNG dùng thư viện icon.
   ============================================================ */

import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

const base = (props: IconProps) => ({
  width: props.size ?? 20,
  height: props.size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M10 8.8v6.4l5.2-3.2z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconTicket = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8.5a1.5 1.5 0 0 0 0 3v.5a2 2 0 0 1 2 2v.5a1.5 1.5 0 0 0 3 0V12h10v.5a1.5 1.5 0 0 0 3 0V12a2 2 0 0 1 2-2v-.5" />
  </svg>
)

export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 19.5c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" />
  </svg>
)

export const IconStar = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.2}>
    <path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
  </svg>
)

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M12 7v5.2l3.2 1.8" />
  </svg>
)

export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
)

export const IconMapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconSeat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 11V8.2A2.2 2.2 0 0 1 7.7 6h8.6a2.2 2.2 0 0 1 2.2 2.2V11M5.5 13.5a1.5 1.5 0 0 1 1.5 1.5v2h10v-2a1.5 1.5 0 0 1 3 0v1.2a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V15a1.5 1.5 0 0 1 1-1.5z" />
  </svg>
)

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 2.8v5.4c0 4.4-3 7.6-7 8.8-4-1.2-7-4.4-7-8.8V5.8z" />
    <path d="M9 11.5l2.2 2.2L15.5 9" />
  </svg>
)

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20.5 20.5l-4.6-4.6" />
  </svg>
)

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
)

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5L22 20H2z" />
    <path d="M12 9.5v4.5M12 17h.01" />
  </svg>
)

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M9.5 6V4.5h5V6M6.5 6.5l1 13h9l1-13M10 10v6M14 10v6" />
  </svg>
)

export const IconEye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconChat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth={2.2} />
  </svg>
)

export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20l4.5-1 10-10-3.5-3.5-10 10zM18.5 5.5l-3.5-3.5M8.5 19H20" />
  </svg>
)