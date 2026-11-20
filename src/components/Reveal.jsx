import { motion } from 'motion/react'
export default function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </M>
  )
}
