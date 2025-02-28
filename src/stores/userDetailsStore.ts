import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'vue3-toastify'
import { apiService } from '@/Services/ApiService'

interface DecodedToken {
  UserId: string
}

interface UserDetails {
  fullName: string
  dateOfBirth: string
  email: string
  gender: string
  address: string
  stateId: number
  constituencyId: number
  phoneNumber: number
  aadharNumber: number
  voterId: string
  candidateId: number | null
  identityProofUrl: string
  profileImageUrl: string
}

export const useDetailsUserStore = defineStore('userDetailsStore', {
  state: () => ({
    userId: 0,
    role: '',
    userDetails: {
      fullName: '',
      dateOfBirth: '',
      email: '',
      gender: '',
      address: '',
      stateId: 0,
      constituencyId: 0,
      phoneNumber: 0,
      aadharNumber: 0,
      voterId: '',
      candidateId: null,
      identityProofUrl: '',
      profileImageUrl: ''
    } as UserDetails,
    electionId: 0
  }),
  actions: {
    // Get Login Details
    getLoginDetails() {
      const voterToken = localStorage.getItem('VoterToken')
      if (!voterToken) {
        throw new Error('Voter token is not available')
      }
      const decodedToken = jwtDecode(voterToken) as DecodedToken
      this.userId = parseInt(decodedToken.UserId || '0')
      this.role = 'Voter'
    },

    // Fetch User Details
    async fetchUserDetails() {
      try {
        if (this.userId === 0) {
          throw new Error('Invalid user ID')
        }
        const userData = await apiService.getUserById(this.userId)
        this.userDetails = {
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth.split('T')[0],
          email: userData.email,
          gender: userData.gender,
          address: userData.address,
          stateId: userData.stateId,
          constituencyId: userData.constituencyId,
          phoneNumber: userData.phoneNumber,
          aadharNumber: userData.aadharNumber,
          voterId: userData.voterId,
          candidateId: userData.candidateId,
          identityProofUrl: userData.identityProofUrl,
          profileImageUrl: userData.profileImageUrl
        }
      } catch (error) {
        toast.error((error as Error).message, { theme: 'dark' })
      }
    },

    // Set Election ID
    setElectionId(newElectionId: number) {
      this.electionId = newElectionId
    }
  }
})
