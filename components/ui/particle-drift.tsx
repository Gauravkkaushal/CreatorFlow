'use client'

import { useEffect, useRef } from 'react'

type ParticleDriftProps = {
  className?: string
  density?: number
}

type Particle = { x: number; y: number; vx: number; vy: number }

/** A lightweight canvas adaptation of the supplied Particle Drift background. */
export function ParticleDrift({ className, density = 150 }: ParticleDriftProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const pointer = { x: -1000, y: -1000 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(density, Math.max(90, Math.round((width * height) / 10000)))
      particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16 }))
    }

    const movePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.x = (particle.x + particle.vx + width) % width
        particle.y = (particle.y + particle.vy + height) % height
      }
      context.lineWidth = 1
      for (let index = 0; index < particles.length; index++) {
        const a = particles[index]
        for (let compare = index + 1; compare < particles.length; compare++) {
          const b = particles[compare]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.hypot(dx, dy)
          if (distance < 155) {
            context.strokeStyle = `rgba(167, 139, 250, ${0.25 * (1 - distance / 155)})`
            context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke()
          }
        }
      }
      for (const particle of particles) {
        const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y)
        const active = distance < 130
        context.fillStyle = active ? 'rgba(216, 180, 254, .9)' : 'rgba(203, 213, 225, .55)'
        context.beginPath(); context.arc(particle.x, particle.y, active ? 2.3 : 1.5, 0, Math.PI * 2); context.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('pointermove', movePointer, { passive: true })
    resize(); draw()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', movePointer) }
  }, [density])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
