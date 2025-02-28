<template>
  <div class="main-footer d-flex justify-content-around p-1 bg-body-secondary position-absolute  w-100 mt-4 ">
    <div class="contact-footer">
      <div class="contact">
        <div class="contact-item  fw-normal d-flex" style="color: #652adf;">Contact</div>
        <div class="items d-flex gap-4">
          <div class="contact-item ">1800 9090 32</div>
          <div class="contact-item ">1800 9000 64</div>
        </div>
      </div>
    </div>
    <div class="powerdedby d-flex">
      <div class="powerdeby-logo d-flex flex-column align-items-center ">
        <div>Powered by</div>
        <div><img :src="QMlogo" style="width: 130px;" alt="logo" /></div>
      </div>

    </div>
    <div class="followus-footer">
      <div class="followus">
        <div class="followus-item fw-normal" style="color: #652adf;">Follow Us</div>
        <div class="items d-flex gap-3">
          <div class="followus-item">
            <Icon icon="mdi:facebook" width="16" />
          </div>
          <div class="followus-item">
            <Icon icon="mdi:twitter" width="16" />
          </div>
          <div class="followus-item">
            <Icon icon="mdi:instagram" width="16" />
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue/dist/iconify.js";
import QMlogo from "@/assets/landingpage/QM_logo.png";
</script>

<style scoped>
.followus-item {
  cursor: pointer;
}

.getIn-item {
  cursor: pointer;
}
</style>
