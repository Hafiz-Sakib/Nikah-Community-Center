/* Adapted from Motion Brew "Binary text" (https://motion-brew.com/components/binary-text), ported to JSX.
   Text scrambles into 0s and 1s, then decodes left to right. Plays in view and again on hover / focus. */
import * as React from 'react'
import { clsx } from 'clsx'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { twMerge } from 'tailwind-merge'

export const BinaryText = React.forwardRef(function BinaryText(
  { text = 'Access granted', duration = 1.1, charset = '01', as: Tag = 'p', className },
  forwardedRef,
) {
  const ref = React.useRef(null)
  React.useImperativeHandle(forwardedRef, () => ref.current)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const still = useReducedMotion()
  const [shown, setShown] = React.useState(text)
  const run = React.useRef(null)

  const play = React.useCallback(() => {
    if (still) return
    run.current?.stop()
    const chars = Array.from(text)
    run.current = animate(0, chars.length, {
      duration,
      ease: 'linear',
      onUpdate: (p) => {
        setShown(chars.map((ch, i) => (ch === ' ' || i < Math.floor(p) ? ch : charset[Math.floor(Math.random() * charset.length)])).join(''))
      },
      onComplete: () => setShown(text),
    })
  }, [text, duration, charset, still])

  React.useEffect(() => { if (inView) play() }, [inView, play])
  React.useEffect(() => () => run.current?.stop(), [])

  return (
    <Tag ref={ref} aria-label={text} tabIndex={0} onPointerEnter={play} onFocus={play}
      className={twMerge(clsx('cursor-default whitespace-pre font-mono tabular-nums outline-none', className))}>
      <span aria-hidden>{shown}</span>
    </Tag>
  )
})
