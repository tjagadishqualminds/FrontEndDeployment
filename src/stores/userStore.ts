import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userDetails = ref({
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
    identityProofUrl: ''
  })

  const userId = ref()

  const setUserId = (newUserId: number) => {
    userId.value = newUserId
  }

  const setUserDetails = (details: Partial<typeof userDetails.value>) => {
    userDetails.value = { ...userDetails.value, ...details }
  }

  return { userDetails, setUserDetails, userId, setUserId }
})
