import { useEffect, useRef } from 'react'
import { animate } from 'motion/react'

export default function AnimatedNumber({ value, prefix = '', className }) {
  const ref = useRef(null)
  const prev = useRef(value)
  const first = useRef(value).current
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString('en-IN') } })
    prev.current = value
    return () => c.stop()
  }, [value, prefix])
  return <span ref={ref} className={className}>{prefix + first.toLocaleString('en-IN')}</span>
}
