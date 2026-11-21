/* Adapted from Motion Brew "Gradient text" (https://motion-brew.com/components/gradient-text), ported to JSX.
   A slow gradient flows through real, selectable text on a seamless loop. */
import * as React from 'react'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'motion/react'
import { twMerge } from 'tailwind-merge'

export const GradientText = React.forwardRef(function GradientText(
  { text = 'Color in motion', as = 'h2', colors = ['#3f87f5', '#7c5cf5', '#22b8cf'], speed = 6, className },
  ref,
) {
  const still = useReducedMotion()
  const Tag = motion[as]
  const stops = [...colors, colors[0]].join(', ')
  return (
    <Tag ref={ref} className={twMerge(clsx('bg-clip-text text-transparent', className))}
      style={{ backgroundImage: `linear-gradient(90deg, ${stops})`, backgroundSize: '200% 100%' }}
      animate={still ? undefined : { backgroundPosition: ['0% 50%', '-200% 50%'] }}
      transition={{ duration: speed, ease: 'linear', repeat: Infinity }}>
      {text}
    </Tag>
  )
})
