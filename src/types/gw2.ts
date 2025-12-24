// Guild Wars 2 API response type definitions

// API Token Info Response
export interface TokenInfo {
  id: string
  name: string
  permissions: string[]
}

// Account Response
export interface AccountInfo {
  id: string
  name: string
  age: number
  world: number
  guilds: string[]
  guild_leader: string[]
  created: string
  access: string[]
  commander: boolean
  fractal_level: number
  daily_ap: number
  monthly_ap: number
  wvw_rank: number
}

// Achievement Response (from /v2/achievements)
export interface AchievementResponse {
  id: number
  icon?: string
  name: string
  description: string
  requirement: string
  locked_text?: string
  type: string
  flags: string[]
  tiers?: Array<{
    count: number
    points: number
  }>
  prerequisites?: number[]
  rewards?: Array<{
    type: string
    id?: number
    count?: number
    region?: string
  }>
  bits?: Array<{
    type: string
    id?: number
    text?: string
  }>
  point_cap?: number
}

// User Achievement Progress Response (from /v2/account/achievements)
export interface AccountAchievementResponse {
  id: number
  bits?: number[]
  current?: number
  max?: number
  done: boolean
  repeated?: number
  unlocked?: boolean
}

// Achievement Category Response
export interface AchievementCategory {
  id: number
  name: string
  description: string
  order: number
  icon: string
  achievements: number[]
}

// Mastery Response
export interface MasteryResponse {
  id: number
  name: string
  requirement: string
  order: number
  background: string
  region: string
  levels: Array<{
    name: string
    description: string
    instruction: string
    icon: string
    point_cost: number
    exp_cost: number
  }>
}

// Account Mastery Points Response
export interface AccountMasteryPointsResponse {
  totals: Array<{
    region: string
    spent: number
    earned: number
  }>
  unlocked: number[]
}

// Account Masteries Response (with level info)
export interface AccountMasteriesResponse {
  id: number
  level: number // 0-indexed, represents highest unlocked level
}

// Map Response
export interface MapResponse {
  id: number
  name: string
  min_level: number
  max_level: number
  default_floor: number
  type: string
  floors: number[]
  region_id?: number
  region_name?: string
  continent_id?: number
  continent_name?: string
  map_rect?: [[number, number], [number, number]]
  continent_rect?: [[number, number], [number, number]]
}

// Continent Floor Response
export interface ContinentFloorResponse {
  texture_dims: [number, number]
  clamped_view?: [[number, number], [number, number]]
  regions: Record<
    string,
    {
      name: string
      label_coord: [number, number]
      continent_rect: [[number, number], [number, number]]
      maps: Record<
        string,
        {
          name: string
          min_level: number
          max_level: number
          default_floor: number
          label_coord: [number, number]
          map_rect: [[number, number], [number, number]]
          continent_rect: [[number, number], [number, number]]
          points_of_interest: Array<{
            id: number
            name: string
            type: string
            floor: number
            coord: [number, number]
            icon?: string
          }>
          god_shrines: Array<unknown>
          tasks: Array<unknown>
          skill_challenges: Array<unknown>
          sectors: Array<unknown>
          adventures: Array<unknown>
        }
      >
    }
  >
}

// API Error Response
export interface ApiError {
  text: string
}
