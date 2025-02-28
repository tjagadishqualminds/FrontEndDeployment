<template>
  <div class="payment-container d-flex justify-content-between align-items-center gap-2">
    <h6>Nomination fee : ₹1000</h6>
    <button type="button" :disabled="isPaymentSuccessful" class="btn btn-success" id="rzp-button1"
      @click="openRazorpayPayment">
      Pay Now
    </button>
    <Modal v-if="isModalVisible" :title="modalTitle" :message="modalMessage" :showModal="isModalVisible"
      @close="isModalVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps } from "vue";
import Modal from "../Modal.vue";

const razorpayKeyId = "rzp_test_6Qg9waPOGHXdTv";
const isPaymentSuccessful = ref(false);
const emit = defineEmits(["payment-success"]);
const isModalVisible = ref<boolean>(false);
const modalTitle = ref<string>("");
const modalMessage = ref<string>("");

const props = defineProps({
  prefill: {
    type: Object,
    default: () => ({
      name: "",
      email: "",
      contact: "",
    }),
  },
});
function openRazorpayPayment() {
  const options = {
    key: razorpayKeyId,
    amount: 1000 * 100,
    currency: "INR",
    name: "eVote",
    description: "Payment for services",
    image: "https://your-logo-url.com/logo.png",
    handler: function (response: any) {
      const paymentId = response.razorpay_payment_id;
      modalTitle.value = "Success";
      modalMessage.value = `Payment successful! Payment ID: ${response.razorpay_payment_id}`;
      isModalVisible.value = true;
      isPaymentSuccessful.value = true;
      emit("payment-success", paymentId);
    },
    prefill: {
      name: props.prefill.name,
      email: props.prefill.email,
      contact: props.prefill.contact,
    },
    theme: {
      color: "#3399cc",
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  document.head.appendChild(script);
});
</script>

<style scoped>
button {
  background-color: #3399cc;
}

button:hover {
  background-color: #287ba0;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}
</style>
