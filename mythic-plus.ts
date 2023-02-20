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
  try {
    const seasonCutoffs = `${baseURL}/mythic-plus/season-cutoffs?season=season-df-1&region=${region}`
    const { data } = await axios.get(encodeURI(seasonCutoffs))
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
