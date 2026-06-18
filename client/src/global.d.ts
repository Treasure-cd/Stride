// Allow importing CSS and SCSS files in TypeScript
declare module '*.css'
declare module '*.scss'
declare module '*.module.css'
declare module '*.module.scss'

// Pendo analytics agent
declare const pendo: {
  track: (eventName: string, properties?: Record<string, unknown>) => void
}
