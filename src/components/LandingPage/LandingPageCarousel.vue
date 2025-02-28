<template>
  <div id="carouselExampleRide" class="carousel slide d-flex justify-content-center p-4 mt-5" data-bs-ride="true">
    <div class="carousel-inner">
      <div v-for="(item, index) in carouselItems" :key="index" class="carousel-item" :class="{ active: index === 0 }"
        :data-bs-interval="item.interval">
        <a :href="item.link" target="_blank">
          <img :src="item.image" class="d-block w-100" :alt="item.alt" />
        </a>
      </div>
    </div>
    <button class="carousel-control-prev d-flex align-items-center justify-content-center" type="button"
      data-bs-target="#carouselExampleRide" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" style="border-radius: 50%; background-color: aqua; padding: 1.5vw"
        aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleRide" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"
        style="border-radius: 50%; background-color: aqua; padding: 1.5vw"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import BlockChain from '../../assets/landingpage/BlockChain2.jpeg';
import Polygon from '@/assets/landingpage/Ganache.png';
import TelanganaElection from '@/assets/landingpage/TelanganaElection.jpeg';
import AndhraElection from '@/assets/landingpage/AndhraElection.jpeg';

interface CarouselItem {
  image: string;
  link: string;
  alt: string;
  interval: number;
}

const carouselItems: CarouselItem[] = [
  {
    image: BlockChain,
    link: "https://www.blockchain.com",
    alt: "BlockChain",
    interval: 1000,
  },
  {
    image: Polygon,
    link: "https://archive.trufflesuite.com/ganache/",
    alt: "Polygon",
    interval: 1000,
  },
  {
    image: TelanganaElection,
    link: "https://ceotelangana.nic.in",
    alt: "Telangana Elections",
    interval: 1000,
  },
  {
    image: AndhraElection,
    link: "https://results.eci.gov.in/AcResultGenJune2024/partywiseresult-S01.htm",
    alt: "Andhra Elections",
    interval: 1000,
  },
];
</script>
