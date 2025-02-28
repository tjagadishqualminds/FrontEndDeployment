import { defineStore } from 'pinia'
interface State {
  candidateId: number | null
  userId: number | null
  userDetails: Record<string, any> | null
}
export interface ElectionFilters {
  electionCode: number | null
  stateId: number | null
  constituencyId: number | null
  partyName: string | null
}
export interface ElectionResult {
  id: number
  electionCode: number
  candidateId: number
  candidateName: string
  partyName: string
  votesReceived: number
  votesPercentage: number
  voteDifference: number
  status: string
  totalVotesCast: number
  constituency: string
  stateId: number
  state: string
  voterTurnout: number
  partyAlliance: string
  partyLogoUrl: string
  constituencyId: number
  totalVotes: number
  electionDate: Date
  electionName: string
}

export interface BriefResult {
  id: number
  constituency: string
  candidateCount: number
  totalVotes: number
  winningCandidate: string
  winningParty: string
  winningVotes: number
}

export const useCandidateStore = defineStore('candidate', {
  state: (): State => ({
    candidateId: null,
    userDetails: null,
    userId: null
  }),
  actions: {
    setCandidateId(candidateId: number | null) {
      this.candidateId = candidateId
    },
    setUserDetails(userDetails: Record<string, any> | null) {
      this.userDetails = userDetails
    }
  }
})
export const useElectionStore = defineStore('election', {
  state: () => ({
    electionResults: [] as ElectionResult[],
    briefResults: [] as BriefResult[],
    elections: [],
    states: [],
    constituencies: [],
    parties: [],
    loading: false,
    error: null as string | null
  })
})
