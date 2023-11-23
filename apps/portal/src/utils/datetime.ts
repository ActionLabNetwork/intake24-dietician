export function convertTo12H(time: string) {
  const timeParts = time.split(':').map(x => parseInt(x, 10))

  if (timeParts.length < 2) {
    throw new Error('Invalid time format. Expected format is HH:mm')
  }

  let [hours, minutes] = timeParts
  if (hours === undefined || minutes === undefined) {
    throw new Error('Invalid time format. Expected format is HH:mm')
  }

  const suffix = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12
  return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

export function formatTime(date: Date): string
export function formatTime(hours: number, minutes: number): string
export function formatTime(
  hoursOrDate: number | Date,
  minutes?: number,
): string {
  if (hoursOrDate instanceof Date) {
    const date = hoursOrDate
    return (
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0')
    )
  } else {
    const hours = hoursOrDate
    return (
      hours.toString().padStart(2, '0') +
      ':' +
      (minutes ?? 0).toString().padStart(2, '0')
    )
  }
}
