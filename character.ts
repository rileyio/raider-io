/* eslint-disable @typescript-eslint/no-explicit-any */
export type CharacterProfile = {
  name: string
  race: string
  class: string
  active_spec_name: string
  active_spec_role: string
  gender: string
  faction: 'alliance' | 'horde'
  achievement_points: number
  honorable_kills: number
  thumbnail_url: string
  region: 'us' | 'eu' | 'tw' | 'kr' | 'cn'
  realm: string
  last_crawled_at: string
  profile_url: string
  profile_banner: string
  covenant: { id: number; name: 'Kyrian' | 'Necrolord' | 'Nightfae' | 'Venthyr'; renown_level: number }
  gear: CharacterProfileGear
  guild?: {
    name: string
    realm: string
  }
  raid_progression: {
    'castle-nathria'?: CharacterProfileRaidProg
    'fated-castle-nathria'?: CharacterProfileRaidProg
    'fated-sanctum-of-domination'?: CharacterProfileRaidProg
    'fated-sepulcher-of-the-first-ones'?: CharacterProfileRaidProg
    'sanctum-of-domination'?: CharacterProfileRaidProg
    'sepulcher-of-the-first-ones'?: CharacterProfileRaidProg
    'vault-of-the-incarnates'?: CharacterProfileRaidProg
  }
  raid_achievement_curve: Array<CharacterProfileRaidCurve>
  mythic_plus_scores?: CharacterProfileMPlusScore
  mythic_plus_scores_by_season: Array<CharacterProfileMPlusScoresBySeason>
}

export type CharacterProfileMPlusScoresBySeason = {
  season: `season-sl-1` | `season-sl-2` | `season-sl-3` | `season-sl-4` | `season-df-1` | `season-df-2`
  scores: CharacterProfileMPlusScore
  segments: CharacterProfileMPlusSegments
}

export type CharacterProfileMPlusScore = {
  all: number
  dps: number
  healer: number
  tank: number
  spec_0: number
  spec_1: number
  spec_2: number
  spec_3: number
}

export type CharacterProfileMPlusSegments = {
  all: CharacterProfileMPlusSegmentStats
  dps: CharacterProfileMPlusSegmentStats
  healer: CharacterProfileMPlusSegmentStats
  tank: CharacterProfileMPlusSegmentStats
  spec_0: CharacterProfileMPlusSegmentStats
  spec_1: CharacterProfileMPlusSegmentStats
  spec_2: CharacterProfileMPlusSegmentStats
  spec_3: CharacterProfileMPlusSegmentStats
}

export type CharacterProfileMPlusSegmentStats = {
  score: number
  color: string
}

export type CharacterProfileGearItem = {
  item_id: number
  item_level: number
  enchant?: number
  icon: string
  name: string
  item_quality: number
  is_legendary: boolean
  is_azerite_armor: boolean
  azerite_powers: Array<any>
  corruption: { added: number; resisted: number; total: number }
  domination_shards: Array<any>
  gems: Array<number>
  bonuses: Array<number>
  tier?: string
}

export type CharacterProfileRaidProg = {
  summary: string
  total_bosses: number
  normal_bosses_killed: number
  heroic_bosses_killed: number
  mythic_bosses_killed: number
}

export type CharacterProfileRaidCurve = {
  raid: 'castle-nathria' | 'sanctum-of-domination' | 'sepulcher-of-the-first-ones' | 'vault-of-the-incarnates'
  aotc: string
  cutting_edge?: string
}

export type CharacterProfileGear = {
  updated_at: string
  item_level_equipped: number
  item_level_total: number
  artifact_traits: number
  corruption: {
    added: number
    resisted: number
    total: number
    cloakRank: number
    spells: Array<any>
  }
  items: {
    head: CharacterProfileGearItem
    neck: CharacterProfileGearItem
    shoulder: CharacterProfileGearItem
    back: CharacterProfileGearItem
    chest: CharacterProfileGearItem
    waist: CharacterProfileGearItem
    shirt: CharacterProfileGearItem
    wrist: CharacterProfileGearItem
    hands: CharacterProfileGearItem
    legs: CharacterProfileGearItem
    feet: CharacterProfileGearItem
    finger1: CharacterProfileGearItem
    finger2: CharacterProfileGearItem
    trinket1: CharacterProfileGearItem
    trinket2: CharacterProfileGearItem
    mainhand: CharacterProfileGearItem
    offhand: CharacterProfileGearItem
  }
}
