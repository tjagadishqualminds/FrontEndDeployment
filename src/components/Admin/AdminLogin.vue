<template>
  <Navbar :nav-items="navData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="dropdownData"
    :logo-url="logoUrl" />
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-10 col-md-5">
          <div class="card border border-2 p-4 shadow">
            <form @submit.prevent="onLogin">
              <h2 class="text-center mb-4">Admin Login</h2>

              <div class="mb-3">
                <label for="voterId" class="form-label fw-bold">Email:</label>
                <input v-model="loginData.Identifier" type="text" class="form-control" placeholder="Enter your Email" />
                <div v-if="loginData.errors.VoterIdOrEmail" class="text-danger small">
                  {{ loginData.errors.VoterIdOrEmail }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label fw-bold">Password:</label>
                <input v-model="loginData.Password" type="password" class="form-control" id="password"
                  placeholder="Enter your password" />
                <div v-if="loginData.errors.Password" class="text-danger small">
                  {{ loginData.errors.Password }}
                </div>
              </div>

              <div class="mb-3">
                <RouterLink :to="`/forgotpassword/${roleId}`" class="text-decoration-none">
                  Forgot Password?
                </RouterLink>
              </div>

              <div class="text-center mb-3">
                <button type="submit" class="btn btn-primary px-4 rounded-3" :disabled="loading">
                  <span v-if="loading">Logging in...</span>
                  <span v-else>Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '../../Services/ApiService'
import Navbar from '../CommonComponents/CommonNavbar.vue'
import { Roles } from '@/Constants/Constants'

const router = useRouter()
const loading = ref(false)
const logoUrl = "/";
const roleId = Roles.Admin

const loginData = reactive({
  Identifier: '',
  Password: '',
  errors: {} as { [key: string]: string }
})

const onLogin = async () => {
  loginData.errors = {}
  loading.value = true

  if (!loginData.Identifier) {
    loginData.errors.Identifier = 'Please enter your email.'
  } else if (!validateEmail(loginData.Identifier)) {
    loginData.errors.Identifier = 'Invalid email.'
  }

  if (!loginData.Password) {
    loginData.errors.Password = 'Please enter your password.'
  } else if (loginData.Password.length < 6) {
    loginData.errors.Password = 'Invalid password.'
  }

  if (Object.keys(loginData.errors).length > 0) {
    loading.value = false
    return
  }

  try {
    const response = await apiService.postUserLogin({
      Identifier: loginData.Identifier,
      Password: loginData.Password,
      loginType: Roles.Admin
    })
    if (response) {
      router.push('/admin/dashboard')
    } else {
      handleLoginError('Invalid login credentials')
    }
  } catch (error) {
    handleLoginError('An unexpected error occurred. Please try again.')
  } finally {
    loading.value = false
  }
}


const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleLoginError = (message: string) => {
  loginData.errors.Identifier = message
  loginData.errors.Password = message
}

const navData = reactive([
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
  { NavItemName: 'Login as Voter', Url: '/voterLogin' },
  { NavItemName: 'Login as Candidate', Url: '/candidateLogin' },
  { NavItemName: 'Login as Admin', Url: '/adminLogin' }
])

const logo = ref('');
onMounted(() => {
  const adminToken = localStorage.getItem('AdminToken');
  if (adminToken) {
    router.push("/admin/dashboard");
  }
})
</script>
