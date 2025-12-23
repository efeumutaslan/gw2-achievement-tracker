// Vercel Serverless Function - GW2 API Proxy
// This proxies requests to GW2 API to avoid CORS issues

import type { VercelRequest, VercelResponse } from '@vercel/node'

const GW2_API_BASE = 'https://api.guildwars2.com/v2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gw2-achievement-tracker.vercel.app',
  'https://gw2-achievement-tracker-bbq81964v-efeumutaslans-projects.vercel.app',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  const origin = req.headers.origin as string
  if (ALLOWED_ORIGINS.includes(origin) || origin?.includes('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the endpoint and API key from query params
    const { endpoint, apiKey, ...otherParams } = req.query

    if (!endpoint || typeof endpoint !== 'string') {
      return res.status(400).json({ error: 'Missing endpoint parameter' })
    }

    // Build GW2 API URL
    const url = new URL(`${GW2_API_BASE}${endpoint}`)

    // Debug logging
    console.log('Proxy request:', { endpoint, params: otherParams })

    // Add query parameters (handle both single values and arrays)
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle array values (e.g., ids: ['1', '2', '3'])
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v) url.searchParams.append(key, String(v))
          })
        } else {
          // Handle single values
          url.searchParams.append(key, String(value))
        }
      }
    })

    // Prepare headers
    const headers: HeadersInit = {
      'User-Agent': 'GW2-Achievement-Tracker/1.0',
    }

    // Add authorization if API key provided
    if (apiKey && typeof apiKey === 'string') {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    // Debug: log final URL
    console.log('Requesting GW2 API:', url.toString())

    // Make request to GW2 API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    // Log response status
    console.log('GW2 API response status:', response.status)

    // Get response data
    const data = await response.json()

    // If GW2 API returned an error, log it
    if (response.status >= 400) {
      console.error('GW2 API error response:', { status: response.status, data })
    }

    // Return response with same status code
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('GW2 API Proxy Error:', error)
    return res.status(500).json({
      error: 'Failed to fetch from GW2 API',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
