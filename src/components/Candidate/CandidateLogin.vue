<template>
  <Navbar :nav-items="landingData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="navdropdownData"
    :logo-url="logoUrl" />
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-10 col-md-5">
          <div class="card border border-2 p-4 shadow">
            <form @submit.prevent="onLogin">
              <h2 class="text-center mb-4">Candidate Login</h2>
              <div class="mb-3">
                <label for="voterId" class="form-label fw-bold">Candidate Id / Email:</label>
                <input v-model="loginData.Identifier" type="text" class="form-control" id="voterId"
                  placeholder="Enter your Candidate Id / Email" />
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
    <Modal v-if="loginError" :visible="loginError" title="Login Error" :message="loginErrorMessage"
      buttonClass="btn-danger" @onClose="closeLoginError" />
  </div>
</template>

<script setup lang="ts">
import Modal from '../Voter/VoterModel.vue'
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../../Services/ApiService';
import { validateEmail } from '../../Services/Validation';
import { Roles } from '@/Constants/Constants'
import Navbar from '../CommonComponents/CommonNavbar.vue';

const router = useRouter();
const loading = ref(false);
const loginError = ref(false);
const loginErrorMessage = ref('');
const roleId = Roles.Candidate;
const logoUrl = "/";

const loginData = reactive({
  Identifier: '',
  Password: '',
  errors: {} as { [key: string]: string }
});

const closeLoginError = () => {
  loginError.value = false;
};

const validateIdentifier = (identifier: string) => {
  if (!identifier) return 'Please enter your Candidate ID or Email.';
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
  const candidateIdOrEmailError = validateIdentifier(loginData.Identifier);
  if (candidateIdOrEmailError) loginData.errors.VoterIdOrEmail = candidateIdOrEmailError;
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
      loginType: Roles.Candidate
    });
    response ? router.push('/candidate/dashboard') : handleLoginError('Invalid login credentials');
  } catch (error) {
    handleLoginError('An unexpected error occurred. Please try again.');
  } finally {
    loading.value = false;
  }
};

const handleLoginError = (errorType: string | undefined) => {
  const messages: Record<string, string> = {
    default: 'Invalid login credentials.'
  };

  const message = messages[errorType || 'default'] || messages.default;
  loginErrorMessage.value = message;
  loginError.value = true;
};

const logo = ref('');
const landingData = reactive([
  {
    NavItemName: "Election Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  }
]);
const dropdownData = reactive([
  { NavItemName: 'Login as Voter', Url: '/voterLogin' },
  { NavItemName: 'Login as Candidate', Url: '/candidateLogin' },
  { NavItemName: 'Login as Admin', Url: '/adminLogin' }
]);
const navdropdownData = reactive([
  { NavItemName: 'Live Results', Url: '/liveresults' },
  { NavItemName: 'Declared Results', Url: '/declaredresults' },
  { NavItemName: 'Elections', Url: '/elections' },
  { NavItemName: 'Login As Voter', Url: '/' },
  { NavItemName: 'Login As Candidate', Url: '/' },
  { NavItemName: 'Login As Admin', Url: '/' }
]);

onMounted(() => {
  const candidateToken = localStorage.getItem('CandidateToken');
  if (candidateToken) {
    router.push("/candidate/dashboard");
  }
})
</script>
