<template>
  <Navbar :nav-items="landingData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="navdropdownData"
    :logo-url="logoUrl" />
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-10 col-md-5">
          <div class="card border border-2 p-4 shadow">
            <form @submit.prevent="onLogin">
              <h2 class="text-center mb-4">Voter Login</h2>

              <div class="mb-3">
                <label for="voterId" class="form-label fw-bold">Voter Id / Email:</label>
                <input v-model="loginData.Identifier" type="text" class="form-control" id="voterId"
                  placeholder="Enter your voter Id / Email" />
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

              <div class="text-center">
                <p class="mb-0">
                  <span class="fw-medium">Not a registered voter yet?</span>
                  <RouterLink to="/registerVoter" class="text-decoration-none ms-2">
                    <span class="text-primary fw-bold">Register Here</span>
                  </RouterLink>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <Modal v-if="loginError" :visible="loginError" title="Login Error" :message="loginErrorMessage"
      buttonClass="btn-danger" @onClose="closeLoginError" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '../../Services/ApiService'
import Navbar from '@/components/CommonComponents/CommonNavbar.vue'
import { validateEmail } from '@/Services/Validation'
import Modal from '../Voter/VoterModel.vue'
import { Roles } from '@/Constants/Constants'

const router = useRouter()
const loading = ref(false)
const roleId = Roles.Voter
const logoUrl = "/";

const loginData = reactive({
  Identifier: '',
  Password: '',
  errors: {} as { [key: string]: string }
})

watch(
  () => loginData.Identifier,
  (newVal) => {
    if (newVal) {
      loginData.errors.VoterIdOrEmail = ''
    }
  }
)

watch(
  () => loginData.Password,
  (newVal) => {
    if (newVal) {
      loginData.errors.Password = ''
    }
  }
)
const validateIdentifier = (identifier: string) => {
  if (!identifier) return 'Please enter your Voter ID or Email.';
  if (identifier.includes('@')) return validateEmail(identifier) || '';
  return identifier.length === 10 ? '' : 'Invalid voter Id';
};

const validatePassword = (password: string) => {
  if (!password) return 'Please enter your password.';
  return password.length >= 6 ? '' : 'Invalid password.';
};

const onLogin = async () => {
  loginData.errors = {};
  loading.value = true;

  const voterIdOrEmailError = validateIdentifier(loginData.Identifier);
  if (voterIdOrEmailError) loginData.errors.VoterIdOrEmail = voterIdOrEmailError;

  const passwordError = validatePassword(loginData.Password);
  if (passwordError) loginData.errors.Password = passwordError;

  if (Object.keys(loginData.errors).length > 0) {
    loading.value = false;
    return;
  }

  try {
    const response = await apiService.postUserLogin({
      Identifier: loginData.Identifier,
      Password: loginData.Password,
      loginType: Roles.Voter
    });

    response ? router.push('/voter/dashboard') : handleLoginError('Invalid login credentials');
  } catch (error) {
    handleLoginError('An unexpected error occurred. Please try again.');
  } finally {
    loading.value = false;
  }
};
const loginError = ref(false)
const loginErrorMessage = ref('')

const handleLoginError = (errorType: string | undefined) => {
  const messages: Record<string, string> = {
    InvalidVoterId: 'Your voter Id is invalid.',
    InvalidEmail: 'Your email is invalid.',
    InvalidPassword: 'You have entered the wrong password.',
    default: 'Invalid login credentials.'
  }

  const message = messages[errorType || 'default'] || messages.default
  loginErrorMessage.value = message
  loginError.value = true
}

const closeLoginError = () => {
  loginError.value = false
}

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
    NavItemName: "Login as Voter",
    Url: "/voterLogin"
  },
  {
    NavItemName: "Login as Candidate",
    Url: "/candidateLogin"
  },
  {
    NavItemName: "Login as Admin",
    Url: "/adminLogin"
  }
]
)

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
    NavItemName: "Login As Voter",
    Url: "/voterLogin"
  },
  {
    NavItemName: "Login As Candidate",
    Url: "/candidateLogin"
  },
  {
    NavItemName: "Login As Admin",
    Url: "/adminLogin"
  }
])

onMounted(() => {
  const VoterToken = localStorage.getItem('VoterToken');
  if (VoterToken) {
    router.push("/voter/dashboard");
  }
})
</script>