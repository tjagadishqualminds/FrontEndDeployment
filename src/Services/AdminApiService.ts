import axios from 'axios'
import config from '../config/apiConfig.json'

interface ErrorResponse {
  message: string
}
interface FetchParams {
  stateId?: string | null
  constituencyId?: string | null
}
class AdminApiService {
  private readonly baseUrl: string = config.baseUrl
  private readonly authUrl: string = config.authUrl

  constructor() {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('AdminToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return this.handleError(error)
      }
    )
  }

  async getNewlyRegisteredCandidates() {
    const url = `${this.baseUrl}${config.endpoints.getnewlyregistercandidates}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getNewlyRegisteredVoters() {
    const url = `${this.baseUrl}${config.endpoints.getnewlyregistervoters}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getAllActiveVoters() {
    const url = `${this.baseUrl}${config.endpoints.activevoters}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getRejectedVoters() {
    const url = `${this.baseUrl}${config.endpoints.rejectedVoters}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAllActiveCandidates() {
    const url = `${this.baseUrl}${config.endpoints.activecandidates}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAllCandidatesDetails(status: number) {
    const url = `${this.baseUrl}${config.endpoints.getCandidatesDetails}${status}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async validateUserByAadhar(validateData: {
    fullName: string
    aadharNumber: number
    dateOfBirth: string
    phoneNumber: number
    address: string
    gender: string
  }): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}${config.endpoints.validateuser}`

    try {
      const { fullName, aadharNumber, dateOfBirth, phoneNumber, address, gender } = validateData
      const validationPayload = {
        fullName: fullName.trim(),
        aadharNumber,
        dateOfBirth,
        phoneNumber,
        address: address.trim(),
        gender: gender.trim()
      }
      const response = await axios.post(url, validationPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        return { success: true, message: response.data.message }
      } else {
        const errorData = response.data as ErrorResponse
        return {
          success: false,
          message: errorData.message
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage: string = error.response.data
        switch (errorMessage) {
          case 'Invalid Aadhar Number':
            return { success: false, message: 'Aadhar number must be 12 digits.' }
          case 'No Aadhar Details Found':
            return { success: false, message: 'No Aadhar details found for this number.' }
          case 'FullName Invalid':
            return {
              success: false,
              message: 'The full name does not match with the Aadhar record.'
            }
          case 'DateOfBirth Invalid':
            return {
              success: false,
              message: 'The date of birth does not match with the Aadhar record.'
            }
          case 'Address Invalid':
            return {
              success: false,
              message: 'The address does not match with the Aadhar record.'
            }
          case 'PhoneNumber Invalid':
            return {
              success: false,
              message: 'The phone number does not match with the Aadhar record.'
            }
          case 'Gender Invalid':
            return {
              success: false,
              message: 'The Gender does not match with the Aadhar record.'
            }
          default:
            return {
              success: false,
              message: 'An unexpected error occurred. Please try again.'
            }
        }
      } else {
        return { success: false, message: 'An unexpected error occurred. Please try again.' }
      }
    }
  }

  async validateUpdateUserByAadhar(validateData: {
    id: number
    fullName: string
    aadharNumber: number
    phoneNumber: number
    address: string
    voterId: string
  }): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}${config.endpoints.updateuservalidate}`

    try {
      const { fullName, aadharNumber, phoneNumber, address, voterId } = validateData
      const validationPayload = {
        fullName: fullName.trim(),
        aadharNumber,
        phoneNumber,
        address: address.trim(),
        voterId: voterId.trim()
      }
      const response = await axios.post(url, validationPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        return { success: true, message: response.data.message }
      } else {
        const errorData = response.data as ErrorResponse
        return {
          success: false,
          message: errorData.message
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage: string = error.response.data
        switch (errorMessage) {
          case 'Invalid Aadhar Number':
            return { success: false, message: 'Aadhar number must be 12 digits.' }
          case 'No Aadhar Details Found':
            return { success: false, message: 'No Aadhar details found for this number.' }
          case 'FullName Invalid':
            return {
              success: false,
              message: 'The full name does not match with the Aadhar record.'
            }

          case 'Address Invalid':
            return {
              success: false,
              message: 'The address does not match with the Aadhar record.'
            }
          case 'PhoneNumber Invalid':
            return {
              success: false,
              message: 'The phone number does not match with the Aadhar record.'
            }
          default:
            return {
              success: false,
              message: 'An unexpected error occurred. Please try again.'
            }
        }
      } else {
        return { success: false, message: 'An unexpected error occurred. Please try again.' }
      }
    }
  }

  async userApprovalOrReject(id: number, reason?: string) {
    if (typeof id !== 'number') {
      throw new Error('userId must be a number.')
    }
    let url = `${this.baseUrl}${config.endpoints.userapprovalorreject}${id}`
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`
    }
    try {
      const response = await axios.put(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async updateuserApproval(UserUpdateData: {
    id: number
    fullName: string
    aadharNumber: number
    phoneNumber: number
    address: string
    voterId: string
  }) {
    const url = `${this.baseUrl}${config.endpoints.updateuserapproval}`
    try {
      const updatePayload = {
        id: UserUpdateData.id,
        fullName: UserUpdateData.fullName.trim(),
        aadharNumber: UserUpdateData.aadharNumber,
        phoneNumber: UserUpdateData.phoneNumber,
        address: UserUpdateData.address.trim(),
        voterId: UserUpdateData.voterId.trim()
      }
      const response = await axios.put(url, updatePayload)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async rejectUpdateUser(userId: number, reason: string) {
    const encodedReason = encodeURIComponent(reason)
    const url = `${config.baseUrl}${config.endpoints.rejectupdateuser}?userId=${userId}&reason=${encodedReason}`
    try {
      const response = await axios.put(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getUpdateUsers() {
    const url = `${this.baseUrl}${config.endpoints.getupdateusers}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getPendingNominations() {
    const url = `${this.baseUrl}${config.endpoints.pendingnominations}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getApprovedNominations(status: number) {
    const url = `${this.baseUrl}${config.endpoints.getCandidatesNominationStatus}${status}`
    try {
      const response = await axios.get(url)
      return response.data || []
    } catch (error) {
      this.handleError(error)
    }
  }

  async getVotersFeedbacks() {
    const url = `${this.baseUrl}${config.endpoints.getvotersfeedback}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async validateNominations(nominationId: number) {
    const url = `${this.baseUrl}${config.endpoints.validatenominations}?nominationId=${nominationId}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async nomineeApprovalOrReject(nominationId: number, reason?: string) {
    if (typeof nominationId !== 'number') {
      throw new Error('userId must be a number.')
    }
    let url = `${this.baseUrl}${config.endpoints.nomineeapprovalorreject}?nominationId=${nominationId}`
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`
    }
    try {
      const response = await axios.put(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async fetchNumberOfElections(params: FetchParams = { stateId: null, constituencyId: null }) {
    const url = `${this.baseUrl}${config.endpoints.numberofelections}`
    try {
      const response = await axios.get(url, { params })
      return response.data // Return the data from the response
    } catch (error) {
      this.handleError(error) // Handle the error as needed
    }
  }

  async fetchCandidatesCount(params: FetchParams = { stateId: null, constituencyId: null }) {
    const url = `${this.baseUrl}${config.endpoints.cumilativecandidatecount}`
    try {
      const response = await axios.get(url, { params })
      return response.data // Return the data from the response
    } catch (error) {
      this.handleError(error) // Handle the error as needed
    }
  }

  async fetchCumulativeVoterCounts(params: FetchParams = { stateId: null, constituencyId: null }) {
    const url = `${this.baseUrl}${config.endpoints.cumilativevotercount}`
    try {
      const response = await axios.get(url, { params })
      return response.data // Return the data from the response
    } catch (error) {
      this.handleError(error) // Handle the error as needed
    }
  }

  async fetchFeedbackSatisfactionCounts(
    params: FetchParams = { stateId: null, constituencyId: null }
  ) {
    const url = `${this.baseUrl}${config.endpoints.feedbackSatisfactionCount}`
    try {
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error) // Handle the error as needed
    }
  }

  async fetchAverageVotingPercentage(
    params: FetchParams = { stateId: null, constituencyId: null }
  ) {
    const url = `${this.baseUrl}${config.endpoints.averageVotingPercentage}`
    try {
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getFilteredVoterFeedbacks(isSatisfied?: boolean) {
    const url = `${this.baseUrl}${config.endpoints.getVoterFeedbacksFiltered}${
      isSatisfied !== undefined ? `?isSatisfied=${isSatisfied}` : ''
    }`

    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }
  async getVoterFeedbackStats() {
    try {
      const allFeedback = await this.getFilteredVoterFeedbacks()
      const positiveFeedback = await this.getFilteredVoterFeedbacks(true)
      const negativeFeedback = await this.getFilteredVoterFeedbacks(false)

      return {
        feedbackList: allFeedback,
        totalFeedback: allFeedback?.length || 0,
        positiveFeedback: positiveFeedback?.length || 0,
        negativeFeedback: negativeFeedback?.length || 0,
        feedbackPercentage: allFeedback?.length
          ? Math.round((positiveFeedback?.length / allFeedback.length) * 100)
          : 0
      }
    } catch (error) {
      this.handleError(error)
      return {
        feedbackList: [],
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        feedbackPercentage: 0
      }
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
export const adminService = new AdminApiService()
