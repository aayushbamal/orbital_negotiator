"use client"

import React, { useEffect, useRef } from "react"

class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 }
    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.target = { x: 0, y: 0 }
    
    // Trail history for transparent backgrounds
    this.history = []
    this.maxHistory = 6

    this.closeEnoughTarget = 60
    this.maxSpeed = 5.0
    this.maxForce = 0.2
    this.particleSize = 2.5
    this.isKilled = false

    this.startColor = { r: 0, g: 240, b: 255 }
    this.targetColor = { r: 0, g: 240, b: 255 }
    this.colorWeight = 0
    this.colorBlendRate = 0.03
  }

  move() {
    // Add current pos to history for trails
    this.history.push({ x: this.pos.x, y: this.pos.y })
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    let proximityMult = 1
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2)
    )

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    )
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx, drawAsPoints) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    // Draw fading trails
    this.history.forEach((pos, index) => {
      const alpha = (index / this.history.length) * 0.45
      ctx.fillStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`
      ctx.fillRect(pos.x, pos.y, this.particleSize, this.particleSize)
    })

    // Draw main particle
    ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
    ctx.fillRect(this.pos.x, this.pos.y, this.particleSize, this.particleSize)
  }

  kill(width, height) {
    if (!this.isKilled) {
      const angle = Math.random() * Math.PI * 2
      const dist = (width + height) * 0.7
      this.target.x = width / 2 + Math.cos(angle) * dist
      this.target.y = height / 2 + Math.sin(angle) * dist

      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 8, g: 12, b: 18 }
      this.colorWeight = 0
      this.isKilled = true
    }
  }
}

export function ParticleTextEffect({ 
  word, 
  textColor = { r: 0, g: 240, b: 255 }, // High-visibility bright default
  width = 600, 
  height = 100,
  fontSize = "22px",
  activeOnHover = false
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const isHoveredRef = useRef(false)

  // Double resolution for high-DPI scaling and high-resolution particle mapping
  const scaleRatio = 2
  const internalWidth = width * scaleRatio
  const internalHeight = height * scaleRatio

  // Extract numeric font size
  const numFontSize = parseInt(fontSize) || 22
  const internalFontSize = `${numFontSize * scaleRatio}px`

  // Use smaller steps for smaller fonts to preserve fine text outlines
  const pixelSteps = numFontSize <= 18 ? 2 : 4

  // Run the animation loop ONLY ONCE on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = internalWidth
    canvas.height = internalHeight

    let animationId

    const animate = () => {
      const ctx = canvas.getContext("2d")
      
      // Fully transparent clean on high-res canvas
      ctx.clearRect(0, 0, internalWidth, internalHeight)

      const particles = particlesRef.current

      // Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        
        if (activeOnHover && isHoveredRef.current) {
          particle.maxSpeed = 9.0
          particle.maxForce = 0.6
        } else {
          particle.maxSpeed = 5.0
          particle.maxForce = 0.2
        }

        particle.move()
        particle.draw(ctx, true)

        if (particle.isKilled) {
          if (
            particle.pos.x < 0 ||
            particle.pos.x > internalWidth ||
            particle.pos.y < 0 ||
            particle.pos.y > internalHeight
          ) {
            particles.splice(i, 1)
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      if (activeOnHover) {
        particlesRef.current.forEach(p => {
          p.vel.x += (Math.random() - 0.5) * 12
          p.vel.y += (Math.random() - 0.5) * 12
        })
      }
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
    }

    canvas.addEventListener("mouseenter", handleMouseEnter)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener("mouseenter", handleMouseEnter)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, []) // Mount-only!

  // Handle word changes and trigger transitions
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && word) {
      const offscreenCanvas = document.createElement("canvas")
      offscreenCanvas.width = internalWidth
      offscreenCanvas.height = internalHeight
      const offscreenCtx = offscreenCanvas.getContext("2d")

      offscreenCtx.fillStyle = "white"
      // Use system-ui / sans-serif fallback directly to avoid canvas font loading delays
      offscreenCtx.font = `bold ${internalFontSize} system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
      offscreenCtx.textAlign = "center"
      offscreenCtx.textBaseline = "middle"
      offscreenCtx.fillText(word, internalWidth / 2, internalHeight / 2)

      const imageData = offscreenCtx.getImageData(0, 0, internalWidth, internalHeight)
      const pixels = imageData.data

      const particles = particlesRef.current
      let particleIndex = 0

      const coordsIndexes = []
      for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
        coordsIndexes.push(i)
      }

      // Shuffle coords
      for (let i = coordsIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = coordsIndexes[i]
        coordsIndexes[i] = coordsIndexes[j]
        coordsIndexes[j] = temp
      }

      for (const coordIndex of coordsIndexes) {
        const alpha = pixels[coordIndex + 3]

        if (alpha > 120) {
          const x = (coordIndex / 4) % internalWidth
          const y = Math.floor(coordIndex / 4 / internalWidth)

          let particle

          if (particleIndex < particles.length) {
            particle = particles[particleIndex]
            particle.isKilled = false
            particleIndex++
          } else {
            particle = new Particle()
            particle.pos.x = internalWidth / 2 + (Math.random() - 0.5) * 200
            particle.pos.y = internalHeight / 2 + (Math.random() - 0.5) * 50

            particle.maxSpeed = Math.random() * 5 + 4
            particle.maxForce = particle.maxSpeed * 0.05
            particle.particleSize = numFontSize <= 18 ? 2.2 : 3.2
            particle.colorBlendRate = Math.random() * 0.04 + 0.02

            particles.push(particle)
          }

          particle.startColor = {
            r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
            g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
            b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
          }
          
          particle.targetColor = {
            r: Math.max(0, Math.min(255, textColor.r + (Math.random() * 20 - 10))),
            g: Math.max(0, Math.min(255, textColor.g + (Math.random() * 20 - 10))),
            b: Math.max(0, Math.min(255, textColor.b + (Math.random() * 20 - 10))),
          }
          particle.colorWeight = 0

          particle.target.x = x
          particle.target.y = y
        }
      }

      for (let i = particleIndex; i < particles.length; i++) {
        particles[i].kill(internalWidth, internalHeight)
      }
    }
  }, [word, textColor]) // Triggers morphing transition when word or textColor change

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          display: "block", 
          background: "transparent"
        }}
      />
    </div>
  )
}
