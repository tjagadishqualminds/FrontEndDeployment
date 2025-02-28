import { reactive } from 'vue';

const modalState = reactive({
  title: '',
  message: '',
  showModal: false,
  onCloseCallback: null as (() => void) | null,
});

export const modalService = {
  getModalState() {
    return modalState;
  },
  show(title: string, message: string,onCloseCallback?: () => void) {
    modalState.title = title;
    modalState.message = message;
    modalState.showModal = true;
    modalState.onCloseCallback = onCloseCallback || null;
  },
  close() {
    modalState.showModal = false;
    if (modalState.onCloseCallback) {
      modalState.onCloseCallback();
      modalState.onCloseCallback = null;
    }
  },
};
