import { useCandidateStore } from './Store'
import config from '../config/apiConfig.json'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Roles } from '@/Constants/Constants'
import { router } from '@/router'

interface ErrorResponse {
  message: string
}
interface DecodedToken {
  exp: number
}

const token = localStorage.getItem('token')
class ApiService {
  private readonly baseUrl: string = config.baseUrl
  private readonly authUrl: string = config.authUrl

  constructor() {
    this.checkTokenExpiration()
    setInterval(() => this.checkTokenExpiration(), 6000)
  }

  private checkTokenExpiration() {
    const voterToken = localStorage.getItem('VoterToken')
    const candidateToken = localStorage.getItem('CandidateToken')
    const adminToken = localStorage.getItem('AdminToken')
    if (voterToken) {
      this.handleTokenExpiration(voterToken, 'voter')
    }
    if (candidateToken) {
      this.handleTokenExpiration(candidateToken, 'candidate')
    }
    if (adminToken) {
      this.handleTokenExpiration(adminToken, 'admin')
    }
  }
  private handleTokenExpiration(token: string, role: string) {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp <= currentTime) {
        this.logout(role)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getParties() {
    const url = `${this.baseUrl}${config.endpoints.parties}`
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getStates() {
    const url = `${this.baseUrl}${config.endpoints.states}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getStateById(stateId: number) {
    const url = `${this.baseUrl}${config.endpoints.getStateById}/${stateId}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getConstituencies(stateId: number) {
    const url = `${this.baseUrl}${config.endpoints.constituencies}/${stateId}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getVoterGenderGroups() {
    const url = `${this.baseUrl}${config.endpoints.getVoterCount}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async postUserLogin(data: { Identifier: string; Password: string; loginType?: number }) {
    const loginType = data.loginType ?? Roles.Voter
    const url = `${this.authUrl}${config.authendpoints.userLogin}?loginType=${loginType}`

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        if (response.data) {
          if (response.data) {
            const { token, userDetails } = response.data
            if (loginType === Roles.Voter) {
              localStorage.setItem('VoterToken', token)
            } else if (loginType === Roles.Candidate) {
              localStorage.setItem('CandidateToken', token)
            } else if (loginType === Roles.Admin) {
              localStorage.setItem('AdminToken', token)
            } else {
              throw new Error('Invalid login credentials')
            }

            const candidateId = userDetails.candidateId
            const candidateStore = useCandidateStore()
            candidateStore.setCandidateId(candidateId)
            candidateStore.setUserDetails(userDetails)
            return { token, userDetails, candidateId }
          } else {
            throw new Error('Invalid login credentials')
          }
        }
      } else {
        throw new Error('Invalid login credentials')
      }
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  logout(role: string) {
    switch (role) {
      case 'voter':
        localStorage.removeItem('VoterToken')
        break
      case 'candidate':
        localStorage.removeItem('CandidateToken')
        break
      case 'admin':
        localStorage.removeItem('AdminToken')
        break
      default:
        console.warn('Unknown role:', role)
    }
    router.push('/')
    const candidateStore = useCandidateStore()
    candidateStore.setCandidateId(null)

    candidateStore.setUserDetails(null)

    localStorage.removeItem('token')
  }

  async postRegistration(data: {
    fullName: string
    dateOfBirth: string
    email: string
    password: string
    confirmPassword: string
    gender: string
    address: string
    stateId: number
    constituencyId: number
    phoneNumber: number
    aadharNumber: number
    identityProofUrl: string
  }): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}${config.endpoints.registration}`

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 201) {
        return { success: true, message: response.data.message || 'Registration successful!' }
      } else {
        const errorData = response.data as ErrorResponse
        return {
          success: false,
          message: errorData.message || 'Something went wrong, please try again.'
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse)?.message ||
          'Registration failed. Please try again.'
        return { success: false, message: errorMessage }
      } else {
        return { success: false, message: 'An unexpected error occurred. Please try again.' }
      }
    }
  }

  async getActiveElections(params?: { searchTerm?: string }) {
    const url = `${this.baseUrl}${config.endpoints.activeElections}`
    try {
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUpcomingElections(params?: { searchTerm?: string }) {
    const url = `${this.baseUrl}${config.endpoints.upcomingElections}`
    try {
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAllElections(params?: { searchTerm?: string }) {
    const url = `${this.baseUrl}${config.endpoints.AllElections}`
    try {
      const token = localStorage.getItem('AdminToken')

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async getCanceledElections(params?: { searchTerm?: string }) {
    const url = `${this.baseUrl}${config.endpoints.CanceledElections}`
    try {
      const token = localStorage.getItem('AdminToken')

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async addElection(data: any) {
    const url = `${this.baseUrl}${config.endpoints.addNewElection}`
    try {
      const token = localStorage.getItem('AdminToken')
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateElection(electionId: number, data: any) {
    const url = `${this.baseUrl}${config.endpoints.updateElection}/${electionId}`
    try {
      const token = localStorage.getItem('AdminToken')
      const response = await axios.put(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteElection(electionId: number) {
    const url = `${this.baseUrl}${config.endpoints.deleteElections}/${electionId}`
    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('AdminToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async postPasswordResetlink(data: { emailOrId: string; roleId: number }) {
    const url = `${this.baseUrl}${config.endpoints.sendPasswordReset}`

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async postNewPassword(token: string, newPassword: string): Promise<string> {
    const url = `${config.baseUrl}${config.endpoints.ResetPassword}`
    const data = { token, newPassword }

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data.message || 'Password reset successful!'
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message

        switch (errorMessage) {
          case 'Invalid or expired token.':
            throw new Error('Reset link expired.')
          case 'User not found.':
            throw new Error('This link has already been used.')
          case 'Password must be different from previous passwords.':
            throw new Error('Password must be different from previous passwords.')
          default:
            throw new Error(errorMessage || 'Failed to reset password. Please try again.')
        }
      } else {
        throw new Error('Failed to reset password. Please try again.')
      }
    }
  }

  async updateUser(
    data: [
      {
        id: number
        fullName: string
        address: string
        phoneNumber: string
        voterId: string
        aadharNumber: string
      }
    ]
  ) {
    const url = `${this.baseUrl}${config.endpoints.updateUser}`
    try {
      const response = await axios.post(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUserById(userId: number) {
    const url = `${this.baseUrl}${config.endpoints.getUserById}/${userId}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUpdateUserById(Id: number) {
    const url = `${this.baseUrl}${config.endpoints.getUpdateUserById}/${Id}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getcandidatevoterconstituency(Id: number) {
    const url = `${this.baseUrl}${config.endpoints.getcandidatevoterconstituency}/${Id}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getFeedbackbyVoterId(voterId: string) {
    const url = `${this.baseUrl}${config.endpoints.getFeedbackbyVoterId}/${voterId}`
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  storeUrl(urlToStore: string): Promise<any> {
    const fullUrl = `${this.baseUrl}${config.endpoints.storeLog}`
    return axios
      .post(
        fullUrl,
        { url: urlToStore },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then((response) => {
        return response
      })
      .catch((error) => {
        throw error
      })
  }

  async fetchManifestos(Id: number) {
    const url = `${config.baseUrl}${config.endpoints.ManifestoInfo}/${Id}`
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async PostFeedback(data: {
    UserId: number
    BlockchainId: number
    ElectionCode: number
    ConstituencyId: number
    VoterId: string
    CandidateId: number
    Feedback: string
    IsSatisfied: boolean
  }) {
    const url = `${this.baseUrl}${config.endpoints.postFeedback}`
    try {
      const response = await axios.post(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async voteCast(data: { voterId: string; candidateId: number; electionId: number }) {
    const url = `${this.baseUrl}${config.endpoints.voteCast}`
    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async fetchVoteByVoterId(voterId: string) {
    const url = `${config.baseUrl}${config.endpoints.getvoteByVoterId}/${voterId}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async PostApplicationFeedback(data: {
    BlockchainId: number
    UserId: number
    ElectionCode: number
    StateId: number
    IsVotingProcessClear: boolean
    IsVotingTransparent: boolean
    Feedback: string
  }) {
    const url = `${this.baseUrl}${config.endpoints.postApplicationFeedback}`
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getApplicationFeedbackByUserId(userId: number) {
    const url = `${this.baseUrl}${config.endpoints.getapplicationByUserId}/${userId}`
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || error.message || 'An unknown error occurred.'
      )
    } else if (error instanceof Error) {
      throw new Error(error.message || 'An unexpected error occurred.')
    } else {
      throw new Error('An unknown error occurred.')
    }
  }
}

export const apiService = new ApiService()
