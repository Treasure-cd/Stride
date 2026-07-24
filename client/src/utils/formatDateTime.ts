export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export const formatShortDate = (value: Date) =>
  value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export const formatTime = (value: Date) =>
  value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
