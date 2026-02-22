const DATE_PATTERN = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T(2[0-3]|[01][0-9]):[0-5][0-9]/

export function dateReviver(_key: string, value: unknown) {
  return typeof value === 'string' && DATE_PATTERN.test(value) ? new Date(value) : value
}

const offset = -new Date().getTimezoneOffset()
const offsetSign = offset >= 0 ? '+' : '-'
const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0')
const formattedTimezone = `${offsetSign}${offsetHours}:${offsetMinutes}`

export function enableDateISO8601Serialization() {
  Date.prototype.toJSON = function () {
    const adjustedDate = new Date(this.getTime() + offset * 60000)
    return adjustedDate.toISOString().slice(0, 19) + formattedTimezone
  }
}