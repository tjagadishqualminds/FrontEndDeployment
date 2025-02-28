<template>
  <div>
    <Navbar :nav-items="landingData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="navdropdownData"
      :logo-url="logoUrl" />
    <div id="voterRegistration" class="container d-flex justify-content-center align-items-center vh-100 ">
      <div class="VoterRegistrationContainer">
        <form @submit.prevent="onRegister">
          <h3 class="text-center mb-4">Voter Registration</h3>
          <div id="RegistrationForm">
            <div class="form-group">
              <label for="fullName">Full Name:</label>
              <input v-model="registrationData.fullName" type="text" id="fullName" placeholder="Enter your full name" />
              <div v-if="registrationData.errors.fullName" class="validation text-danger">
                {{ registrationData.errors.fullName }}
              </div>
            </div>

            <div class="form-group">
              <label for="dob">Date of Birth:</label>
              <input v-model="registrationData.dateOfBirth" type="date" id="dob" />
              <div v-if="registrationData.errors.dateOfBirth" class="validation text-danger">
                {{ registrationData.errors.dateOfBirth }}
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email:</label>
              <input v-model="registrationData.email" type="email" id="email" placeholder="Enter your email" />
              <div v-if="registrationData.errors.email" class="validation text-danger">
                {{ registrationData.errors.email }}
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password:</label>
              <input v-model="registrationData.password" type="password" id="password" placeholder="Enter your password"
                @focus="showPasswordConditions = true" @blur="showPasswordConditions = false"
                @input="validatePassword" />
              <div class="validation text-danger">
                <div v-if="!registrationData.password && registrationData.errors.password">
                  {{ registrationData.errors.password }}
                </div>
                <div v-if="showPasswordConditions && registrationData.password">
                  <div v-for="(condition, index) in passwordConditions" :key="index" :class="{
                    'text-success': condition.isValid,
                    'text-danger': !condition.isValid
                  }">
                    <span v-if="condition.isValid">✓</span>
                    <span v-else>✗</span>
                    {{ condition.message }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input v-model="registrationData.confirmPassword" type="password" id="confirmPassword"
                placeholder="Confirm your password" @input="validateConfirmPassword" />
              <div v-if="registrationData.errors.confirmPassword" class="validation text-danger">
                {{ registrationData.errors.confirmPassword }}
              </div>
            </div>

            <div class="form-group">
              <label for="gender">Gender:</label>
              <div class="radio-group d-flex align-items-center justify-content-around g-5 ">
                <div class="radioName d-flex align-items-center" v-for="gender in ['Male', 'Female', 'Other']"
                  :key="gender">
                  <input v-model="registrationData.gender" type="radio" :id="gender" :value="gender" />
                  <label :for="gender">{{ gender }}</label>
                </div>
              </div>
              <div v-if="registrationData.errors.gender" class="genderValidation text-danger">
                {{ registrationData.errors.gender }}
              </div>
            </div>

            <div class="form-group">
              <label for="address">Address:</label>
              <textarea v-model="registrationData.address" id="address" rows="1"
                placeholder="Enter your address"></textarea>
              <div v-if="registrationData.errors.address" class="addressValidation text-danger">
                {{ registrationData.errors.address }}
              </div>
            </div>

            <div class="form-group">
              <label for="state">State:</label>
              <select v-model.number="registrationData.stateId" id="state"
                @change="selectState(registrationData.stateId)">
                <option value="0" disabled>Select your state</option>
                <option v-for="state in states" :key="state.id" :value="state.id">
                  {{ state.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="constituency">Constituency:</label>
              <select v-model.number="registrationData.constituencyId" id="constituency"
                :disabled="isConstituencyDisabled">
                <option value="0" disabled>Select your constituency</option>
                <option v-for="constituency in constituencies" :key="constituency.id" :value="constituency.id">
                  {{ constituency.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="phoneNumber">Phone Number:</label>
              <input v-model="registrationData.phoneNumber" type="number" id="phoneNumber"
                placeholder="Enter your phone number" />
              <div v-if="registrationData.errors.phoneNumber" class="validation text-danger">
                {{ registrationData.errors.phoneNumber }}
              </div>
            </div>

            <div class="form-group">
              <label for="aadharNumber">Aadhar Number:</label>
              <input v-model="registrationData.aadharNumber" type="number" id="aadharNumber"
                placeholder="Enter your Aadhar number" />
              <div v-if="registrationData.errors.aadharNumber" class="validation text-danger">
                {{ registrationData.errors.aadharNumber }}
              </div>
            </div>

            <div class="form-group">
              <label for="identityProofFile">Identity Proof (Aadhar):</label>
              <input type="file" id="identityProofFile" @change="onFileChange" ref="fileInputRef"
                accept=".jpg, .jpeg, .png, .pdf" />
              <div v-if="registrationData.errors.identityProofUrl" class="identityProof text-danger">
                {{ registrationData.errors.identityProofUrl }}
              </div>
            </div>
          </div>
          <div id="actionButtons" class="d-flex justify-content-center mt-4 gap-5">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
          </div>

          <div id="loginButton text-center mt-2">
            <div class="loginButton text-center mt-2">
              <span>Already a Registered User?</span>
              <RouterLink to="/voterLogin">
                <span>Login Here</span>
              </RouterLink>
            </div>
          </div>
        </form>
      </div>

      <Modal :visible="showBanner" title="Registration Success"
        message="Upon approval, you will be notified through your registered email." buttonClass="btn-primary"
        @onClose="closePopup" />

      <Modal :visible="!!registrationData.errorMessage" title="Registration Failed"
        :message="registrationData.errorMessage" buttonClass="btn-danger" @onClose="closePopup" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { apiService } from '../../Services/ApiService'
import { validateRegistrationData } from '../../Services/RegistrationValidation'
import { uploadImage } from '../../Services/FirebaseHelper'
import Navbar from '../CommonComponents/CommonNavbar.vue'
import Modal from '../Voter/VoterModel.vue'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface RegistrationData {
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
  identityProofFile?: File
  profileImageUrl: string
  roleId: number
  errors: RegistrationErrors
  errorMessage?: string
  successMessage?: string
}

interface RegistrationErrors {
  fullName?: string
  dateOfBirth?: string
  email?: string
  password?: string | { [key: string]: boolean }
  confirmPassword?: string
  gender?: string
  address?: string
  stateId?: string
  constituencyId?: string
  phoneNumber?: string
  aadharNumber?: string
  identityProofUrl?: string
  general?: string
}

const registrationData = reactive<RegistrationData>({
  fullName: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
  address: '',
  stateId: 0,
  constituencyId: 0,
  phoneNumber: 0,
  aadharNumber: 0,
  identityProofUrl: '',
  identityProofFile: undefined,
  profileImageUrl: '',
  roleId: 1,
  errors: {}
})

const showPasswordConditions = ref(false)
const logoUrl = "/";

const passwordConditions = ref([
  { isValid: false, message: 'At least 8 characters', key: 'length' },
  { isValid: false, message: 'Contains an uppercase letter', key: 'uppercase' },
  { isValid: false, message: 'Contains a lowercase letter', key: 'lowercase' },
  { isValid: false, message: 'Contains a number', key: 'number' },
  { isValid: false, message: 'Contains a special character', key: 'specialCharacter' }
])

watch(
  () => registrationData.fullName,
  () => {
    if (registrationData.fullName) registrationData.errors.fullName = undefined
  }
)

watch(
  () => registrationData.dateOfBirth,
  () => {
    if (registrationData.dateOfBirth) registrationData.errors.dateOfBirth = undefined
  }
)

watch(
  () => registrationData.email,
  () => {
    if (registrationData.email) registrationData.errors.email = undefined
  }
)

watch(
  () => registrationData.password,
  () => {
    if (registrationData.password) registrationData.errors.password = undefined
    validatePassword()
  }
)

watch(
  () => registrationData.confirmPassword,
  () => {
    validateConfirmPassword()
  }
)

watch(
  () => registrationData.gender,
  () => {
    if (registrationData.gender) registrationData.errors.gender = undefined
  }
)

watch(
  () => registrationData.address,
  () => {
    if (registrationData.address) registrationData.errors.address = undefined
  }
)

watch(
  () => registrationData.phoneNumber,
  () => {
    if (registrationData.phoneNumber) registrationData.errors.phoneNumber = undefined
  }
)

watch(
  () => registrationData.aadharNumber,
  () => {
    if (registrationData.aadharNumber) registrationData.errors.aadharNumber = undefined
  }
)

const states = ref<any[]>([])
const constituencies = ref<any[]>([])
const isConstituencyDisabled = ref(true)
const showBanner = ref(false)

function validatePassword() {
  const password = registrationData.password
  passwordConditions.value[0].isValid = password.length >= 8
  passwordConditions.value[1].isValid = /[A-Z]/.test(password)
  passwordConditions.value[2].isValid = /[a-z]/.test(password)
  passwordConditions.value[3].isValid = /\d/.test(password)
  passwordConditions.value[4].isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password)
}

function validateConfirmPassword() {
  if (registrationData.password.length > 0 && registrationData.confirmPassword.length > 0) {
    registrationData.errors.confirmPassword =
      registrationData.confirmPassword === registrationData.password
        ? undefined
        : 'Passwords do not match'
  } else {
    registrationData.errors.confirmPassword = undefined
  }
}

async function fetchStates() {
  try {
    const response = await apiService.getStates()
    states.value = response
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
}

async function selectState(selectedStateId: number) {
  if (selectedStateId > 0) {
    await fetchConstituencies(selectedStateId)
  } else {
    registrationData.constituencyId = 0
    isConstituencyDisabled.value = true
  }
}

async function fetchConstituencies(stateId: number) {
  try {
    const response = await apiService.getConstituencies(stateId)
    constituencies.value = response
    isConstituencyDisabled.value = false
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
}

const fileInputRef = ref<HTMLInputElement | null>(null)

async function onRegister() {
  registrationData.errorMessage = ''

  if (registrationData.identityProofFile) {
    try {
      const uploadedUrl = await uploadImage(registrationData.identityProofFile, 'identityProofs')
      registrationData.identityProofUrl = uploadedUrl
    } catch (error) {
      registrationData.errors.identityProofUrl = 'Error uploading file. Please try again.'
      return
    }
  }

  interface RegistrationErrors {
    aadharNumber?: string | number
    phoneNumber?: string | number
  }

  let validationErrors: RegistrationErrors = validateRegistrationData(registrationData) || {}

  if (validationErrors) {
    if (typeof validationErrors.aadharNumber === 'number') {
      validationErrors.aadharNumber = validationErrors.aadharNumber.toString()
    }

    if (typeof validationErrors.phoneNumber === 'number') {
      validationErrors.phoneNumber = validationErrors.phoneNumber.toString()
    }

    if (Object.keys(validationErrors).length) {
      registrationData.errors = validationErrors as typeof registrationData.errors
      registrationData.errorMessage = 'Please fix the validation errors.'
      return
    }
  }

  try {
    const response = await apiService.postRegistration({
      ...registrationData
    })

    if (response.success) {
      showBanner.value = true
      resetForm()
    } else {
      registrationData.errorMessage = response.message || 'Registration failed. Please try again.'
    }
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
    registrationData.errors.general =
      'An error occurred during registration. Please try again later.'
  }
}

function resetForm() {
  registrationData.fullName = ''
  registrationData.dateOfBirth = ''
  registrationData.email = ''
  registrationData.password = ''
  registrationData.confirmPassword = ''
  registrationData.gender = ''
  registrationData.address = ''
  registrationData.stateId = 0
  registrationData.constituencyId = 0
  registrationData.phoneNumber = 0
  registrationData.aadharNumber = 0
  registrationData.identityProofUrl = ''
  registrationData.identityProofFile = undefined
  registrationData.errors = {}

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    registrationData.identityProofFile = input.files[0]
    registrationData.errors.identityProofUrl = undefined
  } else {
    registrationData.identityProofFile = undefined
    registrationData.errors.identityProofUrl = 'Identity proof is required.'
  }
}

function closePopup() {
  showBanner.value = false
  registrationData.errorMessage = ''
}
watch(() => registrationData.password, validatePassword)

onMounted(() => {
  fetchStates()
})

const logo = ref('')
const landingData = reactive([
  {
    NavItemName: "Election Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  }
])

const dropdownData = reactive([
  {
    NavItemName: 'Login as Voter',
    Url: '/'
  },
  {
    NavItemName: 'Login as Candidate',
    Url: '/'
  },
  {
    NavItemName: 'Login as Admin',
    Url: '/'
  }
])

const navdropdownData = reactive([
  {
    NavItemName: "Election Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  },
  {
    NavItemName: 'Elections',
    Url: '/elections'
  },
  {
    NavItemName: 'Login As Voter',
    Url: '/'
  },
  {
    NavItemName: 'Login As Candidate',
    Url: '/'
  },
  {
    NavItemName: 'Login As Admin',
    Url: '/'
  }
])
</script>

<style scoped>
.validation {
  margin-top: -12px;
  margin-bottom: 15px;
}

#RegistrationForm label {
  font-size: small;
  margin-bottom: 3px;
}

#successMessage {
  margin-top: 10px;
  color: green;
  align-items: center;
}

#RegistrationForm :placeholder-shown {
  font-size: small;
}

.genderValidation {
  color: red;
  margin-top: -10px;
}

.addressValidation {
  color: red;
  margin-top: -2px;
}

#RegistrationForm {
  position: relative;
  overflow: scroll;
  height: 60vh;
  overflow-x: hidden;
  border: 1px solid black;
  padding: 15px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.radio-group input {
  margin-top: 15px;
  margin-right: 10px;
}

#address {
  width: 100%;
  padding: 8px;
}

#constituency,
#state {
  width: 100%;
  padding: 8px;
  font-size: small;
  margin-bottom: 5px;
}

.btn-primary:hover {
  background-color: rgb(74, 44, 227);
}
</style>