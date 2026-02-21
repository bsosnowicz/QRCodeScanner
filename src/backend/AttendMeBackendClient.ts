import { dateReviver } from '../helpers/JsonHelpers'
import {
  AttendMeBackendClientBase,
  type DeviceRegisterDTO,
  type TokenResult,
} from './AttendMeBackendClientBase'

export class AttendMeBackendClient extends AttendMeBackendClientBase {
  userTokenResult?: TokenResult
  deviceTokenResult?: TokenResult
  onUnauthorized?: (url: string) => void

  constructor(url: string) {
    const http: unknown = {
      fetch: null,
    }
    super(url, http as ApiHttpClient)
    ;(http as ApiHttpClient).fetch = this.fetchWrapper.bind(this)

    this.jsonParseReviver = dateReviver

    this.restoreTokens()
  }

  restoreTokens() {
    const rawDeviceAuthData = window.localStorage.getItem('attend-me:deviceAuthData')
    if (rawDeviceAuthData) {
      this.deviceTokenResult = JSON.parse(rawDeviceAuthData, dateReviver)
    }

    const rawUserAuthData = window.localStorage.getItem('attend-me:userAuthData')
    if (rawUserAuthData) {
      this.userTokenResult = JSON.parse(rawUserAuthData, dateReviver)
    }
  }

  deviceAuthReset() {
    this.deviceTokenResult = undefined
    window.localStorage.removeItem('attend-me:deviceAuthData')
  }

  override userLogin(loginName: string, password: string): Promise<TokenResult> {
    return super.userLogin(loginName, password).then((r) => {
      if (!r || !r.token) throw new Error('Authorization response returned empty token!')

      this.userTokenResult = r
      window.localStorage.setItem('attend-me:userAuthData', JSON.stringify(r))

      return r
    })
  }

  userLogout() {
    this.userTokenResult = undefined
    window.localStorage.removeItem('attend-me:userAuthData')
  }

  userDeviceRegisterWithToken(token: string, data: DeviceRegisterDTO): Promise<TokenResult> {
    if (!token) {
      return Promise.reject(new Error('Token rejestracyjny jest wymagany'))
    }
    
    this.deviceTokenResult = {
      token,
    }
    
    return super.userDeviceRegister(data).then((r) => {
      if (!r || !r.token) {
        throw new Error('Odpowiedź rejestracji zwróciła pusty token!')
      }
      
      this.deviceTokenResult = r

      window.localStorage.setItem('attend-me:deviceAuthData', JSON.stringify(r))

      return r
    }).catch((error) => {
      this.deviceTokenResult = undefined
      throw error
    })
  }

  private fetchWrapper(requestInfo: RequestInfo, init?: RequestInit): Promise<Response> {
    const opts: RequestInit = {
      ...init,
    }

    const requestUrl = typeof requestInfo === 'string' ? requestInfo : requestInfo.url
    
    let path = ''
    try {
      const parsedUrl = new URL(requestUrl)
      path = parsedUrl.pathname
    } catch {
      path = requestUrl
    }
    
    const headers = new Headers(opts.headers)
    
    if (
      this.deviceTokenResult?.token &&
      (path.startsWith('/user/device/register') ||
        path.startsWith('/user/attendance/ticket/get') ||
        path.startsWith('/course/session/attendance/register')) &&
      !path.startsWith('/user/device/register/token/get')
    ) {
      headers.set('Authorization', `Bearer ${this.deviceTokenResult.token}`)
    } else if (this.userTokenResult?.token && !path.startsWith('/user/login')) {
      headers.set('Authorization', `Bearer ${this.userTokenResult.token}`)
    }
    
    opts.headers = headers

    const request = fetch(requestInfo, opts)

    if (this.onUnauthorized) {
      return request.then((response) => {
        if (response.status === 401 && this.onUnauthorized) {
          this.onUnauthorized(requestUrl)
        }

        return response
      })
    }

    return request
  }
}

type ApiHttpClient = {
  fetch(url: RequestInfo, init?: RequestInit): Promise<Response>
}

export const Backend = new AttendMeBackendClient('https://attendme-backend.runasp.net')

