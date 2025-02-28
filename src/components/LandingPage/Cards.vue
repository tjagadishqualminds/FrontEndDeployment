<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="cards-main d-md-flex flex-md-row flex-column mt-5 justify-content-evenly mb-5">
    <div class="card d-flex flex-column gap-4 align-items-center p-2" v-for="(data, index) in cardData" :key="index">
      <div class="image"><img :src="data.cardImage" style="width: 20vw" alt="loginimg" /></div>
      <Router-link :to="data.url" class="md-w-100">
        <button type="button" class="btn md-w-100 fw-medium">{{ data.cardHeading }}</button>
      </Router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import Voter from '../././../assets/landingpage/Voter.jpeg'
import Candidate from '../././../assets/landingpage/Candidate.jpg'
import Admin from '../././../assets/landingpage/Admin.jpg'

const cardData = reactive([
  {
    cardHeading: 'Login as Voters',
    cardImage: Voter,
    url: '/voterLogin'
  },
  {
    cardHeading: ' Login as Candidate',
    cardImage: Candidate,
    url: '/candidateLogin'
  },
  {
    cardHeading: 'Login as Admin',
    cardImage: Admin,
    url: '/adminLogin'
  }
])
</script>
<style scoped>
button {
  background: linear-gradient(90deg, #804de7, #a86aef);
  /* Gradient from left to right */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition:
    background 0.3s ease,
    font-weight 0.3s ease;
}

button:hover {
  background: linear-gradient(90deg, #1974ea, #42a1f5);
  color: white;
  font-weight: 400;
}

.card {
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}
</style>
