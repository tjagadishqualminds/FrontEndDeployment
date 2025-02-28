<template>
   <div class="cards-main  p-4  d-md-flex flex-md-row flex-column gap-3 mt-5 justify-content-evenly">
      <div v-for="(card, index) in cardData" :key="index"
         class="card d-flex flex-column gap-4 align-items-center p-2 mb-5">
         <div class="cardHeading fs-3 fw-semibold border-bottom border-primary border-2 p-1">{{ card.cardHeading }}
         </div>
         <div class="image"><img :src="card.cardImage" style="width: 20vw; max-width: 100%; height:40vh"
               alt="electionimg" /></div>
         <div class="cardDescription p-4" style="width: 33vw;">{{ card.cardDescrption }}</div>
      </div>
   </div>
</template>


<script lang="ts" setup>
import ElectionNewsImage from "../../assets/landingpage/Voter.jpeg"
import UpcomingElectionImg from "@/assets/landingpage/UpComingElectionImg.png"
import LiveResultImg from "@/assets/landingpage/graph.png"
import { reactive } from 'vue';

const cardData = reactive([{
   cardHeading: "Election News",
   cardImage: UpcomingElectionImg,
   cardDescrption: "The election process is a vibrant example of democracy in action, where millions of citizens exercise their right to vote. From national to state and local levels, elections are conducted with great zeal and enthusiasm.."
}, {
   cardHeading: "Upcoming Elections",
   cardImage: ElectionNewsImage,
   cardDescrption: "Elections are expected in Telangana, Andhra Pradesh, and other states, with specific dates yet to be announced. These elections will significantly influence the political scenario leading up to the 2024 Lok Sabha elections."
}, {
   cardHeading: "Live Elections",
   cardImage: LiveResultImg,
   cardDescrption: "The Telangana and Andhra Pradesh Assembly elections are ongoing. Results are being updated in real time, showing dynamic shifts as votes are counted across constituencies."
}])

</script>
<style scoped>
button {
   background-color: #7fffd4;
}

button:hover {
   background-color: rgb(25, 234, 164);
   color: white;
   font-weight: 300;
}

.card {
   box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
}

.card:hover {
   border-radius: 2px solid #7fffd4;
}

.cards-main :hover {
   border-radius: 2px solid #7fffd4;
   cursor: pointer;
}
</style>