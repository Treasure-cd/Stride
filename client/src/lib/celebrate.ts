import confetti from 'canvas-confetti'

const fanfare = new Audio('/fanfare.wav')

export function celebrate() {
  fanfare.currentTime = 0
  fanfare.play().catch(() => {}) 

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6d28d9', '#a78bfa', '#f5f5f5'],
  })
}