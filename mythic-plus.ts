import * as path from 'path'

import { readFileSync, writeFileSync } from 'fs'

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

export type MythicPlusCutoffs = {
  cutoffs: {
    updatedAt: string
    region: {
      name: string
      slug: string
      short_name: string
    }
    /**
     * Top 0.1% (Season Title)
     * @type {MythicPlusCutoffsTopRatingPercentile}
     */
    p999: MythicPlusCutoffsTopRatingPercentile
    /**
     * Top 1%
     * @type {MythicPlusCutoffsTopRatingPercentile}
     */
    p990: MythicPlusCutoffsTopRatingPercentile
    /**
     * Top 10%
     * @type {MythicPlusCutoffsTopRatingPercentile}
     */
    p900: MythicPlusCutoffsTopRatingPercentile
    /**
     * Top 25%
     * @type {MythicPlusCutoffsTopRatingPercentile}
     */
    p750: MythicPlusCutoffsTopRatingPercentile
    /**
     * Top 60%
     * @type {MythicPlusCutoffsTopRatingPercentile}
     */
    p600: MythicPlusCutoffsTopRatingPercentile
  }
}

export type MythicPlusCutoffsTopScores = {
  quantile: number
  quantileMinValue: number
  quantilePopulationCount: number
  quantilePopulationFraction: number
  totalPopulationCount: number
}

export type MythicPlusCutoffsTopRatingPercentile = {
  horde: MythicPlusCutoffsTopScores
  hordeColor: string
  alliance: MythicPlusCutoffsTopScores
  allianceColor: string
  all: MythicPlusCutoffsTopScores
  allColor: string
}

export const fetchSeasonCutoffs = async (baseURL: string, region: string) => {
  // Get last cached time
  const cached = await readMPlusCutoffCache()

  if (cached) return cached.data

  try {
    const seasonCutoffs = `${baseURL}/mythic-plus/season-cutoffs?season=season-df-2&region=${region}`
    const { data } = await axios.get(encodeURI(seasonCutoffs))

    // Cache data to prevent needing to look up again too soon
    await writeMPlusCutoffCache(data)

    return data
  } catch (error) {
    console.error(error)
    return null
  }
}

export function getMythicPlusScorePlacement(data: MythicPlusCutoffs, score: number) {
  if (data.cutoffs.p999.all.quantileMinValue <= score) return 'Top 0.1% (Season Title)'
  if (data.cutoffs.p990.all.quantileMinValue <= score) return 'Top 1%'
  if (data.cutoffs.p900.all.quantileMinValue <= score) return 'Top 10%'
  if (data.cutoffs.p750.all.quantileMinValue <= score) return 'Top 25%'
  if (data.cutoffs.p600.all.quantileMinValue <= score) return 'Top 60%'
}

async function readMPlusCutoffCache(): Promise<{ cached: string; data: MythicPlusCutoffs } | null> {
  try {
    const cutoffs = await readFileSync(path.join(__dirname, './cache/season-cutoffs.json'), 'utf8')

    // Check if cache is older than 1 hour
    if (Date.now() - new Date(JSON.parse(cutoffs).cached).getTime() > 3600000) {
      console.log('M+ Season Cutoff data IS older than one hour')
      return null
    }

    console.log('M+ Season Cutoff data IS NOT older than one hour - reusing cached data')
    return JSON.parse(cutoffs)
  } catch (error) {
    console.warn(error)
    return null
  }
}

async function writeMPlusCutoffCache(data: MythicPlusCutoffs) {
  try {
    await writeFileSync(
      path.join(__dirname, './cache/season-cutoffs.json'),
      JSON.stringify({
        cached: new Date(),
        data
      })
    )
  } catch (error) {
    console.error(error)
  }
}
