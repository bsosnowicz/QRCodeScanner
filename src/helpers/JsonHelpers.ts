const DATE_PATTERN =
  /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T(2[0-3]|[01][0-9]):[0-5][0-9]/

export function dateReviver(key: string, value: unknown) {
  if (typeof value === 'string' && DATE_PATTERN.test(value)) {
    return new Date(value)
  }
  return value
}

const offset = -new Date().getTimezoneOffset()
const offsetHours = Math.floor(Math.abs(offset) / 60)
const offsetMinutes = Math.abs(offset) % 60
const offsetSign = offset >= 0 ? '+' : '-'

const formattedTimezone = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`

export function enableDateISO8601Serialization() {
  Date.prototype.toJSON = function () {
    const isoString = getLocalIsoString(this)
    return isoString.slice(0, 19) + formattedTimezone
  }
}

function getLocalIsoString(date: Date) {
  const adjustedDate = new Date(date.getTime() + offset * 60 * 1000)
  return adjustedDate.toISOString().slice(0, 19)
}

