// Account API Service for user account-related endpoints

import { gw2Api } from './gw2Api'
import { CACHE_TTL } from '../cache/cacheManager'
import type { TokenInfo, AccountInfo } from '@/types/gw2'

export class AccountService {
  // Validate API key and get token info
  async getTokenInfo(apiKey: string): Promise<TokenInfo> {
    return gw2Api.get<TokenInfo>('/tokeninfo', {
      apiKey,
      cache: {
        key: `tokeninfo:${apiKey}`,
        ttl: CACHE_TTL.TOKEN_INFO,
      },
    })
  }

  // Get account information
  async getAccountInfo(apiKey: string): Promise<AccountInfo> {
    return gw2Api.get<AccountInfo>('/account', {
      apiKey,
      cache: {
        key: `account:${apiKey}`,
        ttl: CACHE_TTL.ACCOUNT_INFO,
      },
    })
  }

  // Validate API key
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.getTokenInfo(apiKey)
      return true
    } catch (error) {
      console.error('API key validation failed:', error)
      return false
    }
  }

  // Get account with token info (for initial setup)
  async getAccountWithTokenInfo(apiKey: string): Promise<{
    account: AccountInfo
    token: TokenInfo
  }> {
    const [account, token] = await Promise.all([
      this.getAccountInfo(apiKey),
      this.getTokenInfo(apiKey),
    ])

    return { account, token }
  }
}

// Export singleton instance
export const accountService = new AccountService()
