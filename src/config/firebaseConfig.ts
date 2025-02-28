import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC_DMCGnNsaCz-xgPn3blnjHTEkEDiFCGs",
  authDomain: "votingsystem-549ad.firebaseapp.com",
  projectId: "votingsystem-549ad",
  storageBucket: "votingsystem-549ad.appspot.com",
  messagingSenderId: "490774224738",
  appId: "1:490774224738:web:9f74e112ba10c62582563b",
  measurementId: "G-MFCTHCK1LS"
}
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
export { storage };
