import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Configuração simplificada para acesso público ao Firebase Realtime Database
const firebaseConfig = {
  databaseURL: "https://agenda-portal-2d149-default-rtdb.firebaseio.com",
  projectId: "agenda-portal-2d149",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
