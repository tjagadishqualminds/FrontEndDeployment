<template>
    <dialog v-if="visible" class="modal fade show" style="display: block; background-color: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-dialog-centered top-0">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title }}</h5>
                </div>
                <div class="modal-body">
                    <p class="fw-semibold" v-html="message"></p>
                    <div v-if="showReasonInput" class="mb-3">
                        <label class="form-label" for="reason">Reason:</label>
                        <input type="text" class="form-control" v-model="reasontextinput" />
                        <div v-if="error" class="text-danger small mt-1">{{ error }}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" v-if="isButtonEnableOk" :class="buttonClass || 'btn btn-primary'"
                        @click="emitClose">Ok</button>
                    <button type="button" v-if="isButtonEnableConfirm" :class="buttonClass || 'btn btn-primary'"
                        @click="emitConfirm">Confirm</button>
                    <button type="button" v-if="!isButtonEnableOk" :class="buttonClass || 'btn btn-secondary'"
                        @click="emitClose">Close</button>
                    <button v-if="showReasonInput" type="button" class="btn btn-danger"
                        @click="onSubmitReason">Reject</button>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    title: String,
    message: String,
    buttonClass: String,
    isButtonEnableOk: Boolean,
    showReasonInput: Boolean,
    isButtonEnableConfirm: Boolean,
    reasontext: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['onClose', 'onSubmitReason', 'onConfirm']);
const reasontextinput = ref('');
const error = ref('');

watch(() => props.visible, (newVal) => {
    if (newVal) {
        reasontextinput.value = '';
        error.value = '';
    }
});

watch(() => props.reasontext, (newVal) => {
    reasontextinput.value = newVal;
});

function emitClose() {
    emit('onClose');
};

function emitConfirm() {
    emit('onConfirm');
}

const onSubmitReason = () => {
    if (!reasontextinput.value.trim()) {
        error.value = "Reason can't be empty";
        return;
    }
    error.value = '';
    emit('onSubmitReason', reasontextinput.value);
};
</script>