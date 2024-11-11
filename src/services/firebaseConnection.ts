import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBnRBZSnx5YJbNNB9Lu7jExceD8Ejc2xPQ',
  authDomain: 'webcarros-64f9d.firebaseapp.com',
  projectId: 'webcarros-64f9d',
  storageBucket: 'webcarros-64f9d.appspot.com',
  messagingSenderId: '600620619844',
  appId: '1:600620619844:web:5e301702907f92f52e0411',
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { auth, db, storage }
