// GW2 API Client with rate limiting, caching, and error handling

import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios'
import { db } from '../db/indexedDB'

// Rate limiter using token bucket algorithm
class RateLimiter {
  private tokens: number
  private readonly maxTokens: number
  private readonly refillRate: number
  private lastRefill: number

  constructor(maxTokens: number, refillIntervalMs: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillRate = maxTokens / refillIntervalMs
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = timePassed * this.refillRate
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.refill()
    }

    this.tokens -= 1
  }

  async backoff(retryCount: number): Promise<void> {
    // Exponential backoff: 2^retryCount * 1000ms
    const waitTime = Math.min(Math.pow(2, retryCount) * 1000, 30000) // Max 30 seconds
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

interface RequestOptions {
  apiKey?: string
  params?: Record<string, unknown>
  cache?: {
    key: string
    ttl: number // Time to live in ms
  }
  deduplicate?: boolean // Prevent duplicate in-flight requests
  retries?: number // Number of retries on failure
}

export class GW2ApiClient {
  private readonly baseURL: string
  private readonly axiosInstance: AxiosInstance
  private readonly rateLimiter: RateLimiter
  private readonly requestQueue: Map<string, Promise<unknown>>
  private readonly useProxy: boolean

  constructor() {
    // Use proxy in production, direct API in development
    this.useProxy = import.meta.env.PROD || window.location.hostname.includes('vercel.app')
    this.baseURL = this.useProxy ? '/api/gw2-proxy' : 'https://api.guildwars2.com/v2'

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // 15 second timeout
    })

    // 600 requests per minute for authenticated requests
    this.rateLimiter = new RateLimiter(600, 60000)
    this.requestQueue = new Map()

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        await this.rateLimiter.acquire()
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Log error for debugging
        console.error('API Error:', error.message, error.response?.data)
        return Promise.reject(error)
      }
    )
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Check cache first
    if (options?.cache) {
      const cached = await this.getFromCache<T>(options.cache.key)
      if (cached !== null) {
        return cached
      }
    }

    // Check if request is already in flight (deduplication)
    if (options?.deduplicate) {
      const requestKey = this.getRequestKey(endpoint, options.params)
      const inFlightRequest = this.requestQueue.get(requestKey)
      if (inFlightRequest) {
        return inFlightRequest as Promise<T>
      }
    }

    // Create request promise
    const requestPromise = this.executeRequest<T>(endpoint, options)

    // Store in flight request
    if (options?.deduplicate) {
      const requestKey = this.getRequestKey(endpoint, options.params)
      this.requestQueue.set(requestKey, requestPromise)

      requestPromise.finally(() => {
        this.requestQueue.delete(requestKey)
      })
    }

    return requestPromise
  }

  private async executeRequest<T>(
    endpoint: string,
    options?: RequestOptions,
    retryCount = 0
  ): Promise<T> {
    try {
      let config: AxiosRequestConfig

      if (this.useProxy) {
        // When using proxy, send everything as query params
        config = {
          params: {
            endpoint,
            ...options?.params,
            ...(options?.apiKey && { apiKey: options.apiKey }),
          },
        }
      } else {
        // Direct API call
        config = {
          params: options?.params,
        }

        // Add authorization header if API key provided
        if (options?.apiKey) {
          config.headers = {
            Authorization: `Bearer ${options.apiKey}`,
          }
        }
      }

      const requestEndpoint = this.useProxy ? '' : endpoint
      const response = await this.axiosInstance.get<T>(requestEndpoint, config)

      // Cache the response
      if (options?.cache) {
        await this.saveToCache(options.cache.key, response.data, options.cache.ttl)
      }

      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle rate limiting (429 Too Many Requests)
        if (error.response?.status === 429) {
          const maxRetries = options?.retries ?? 3
          if (retryCount < maxRetries) {
            await this.rateLimiter.backoff(retryCount)
            return this.executeRequest<T>(endpoint, options, retryCount + 1)
          }
        }

        // Handle network errors with retry
        if (!error.response && retryCount < (options?.retries ?? 3)) {
          await this.rateLimiter.backoff(retryCount)
          return this.executeRequest<T>(endpoint, options, retryCount + 1)
        }

        // Handle invalid API key
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Invalid or unauthorized API key')
        }

        // Handle not found
        if (error.response?.status === 404) {
          throw new Error(`Resource not found: ${endpoint}`)
        }
      }

      throw error
    }
  }

  private getRequestKey(endpoint: string, params?: Record<string, unknown>): string {
    return `${endpoint}:${JSON.stringify(params ?? {})}`
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const entry = await db.cache.get(key)

      if (!entry) {
        return null
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await db.cache.delete(key)
        return null
      }

      return entry.data as T
    } catch (error) {
      console.error('Cache read error:', error)
      return null
    }
  }

  private async saveToCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await db.cache.put({
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      })
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }

  // Utility method to test API key validity
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.get('/tokeninfo', { apiKey })
      return true
    } catch {
      return false
    }
  }

  // Utility method to check if online
  isOnline(): boolean {
    return navigator.onLine
  }
}

// Export singleton instance
export const gw2Api = new GW2ApiClient()
