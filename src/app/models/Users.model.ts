import firebase from "firebase";
import Timestamp = firebase.firestore.Timestamp;

export interface User{
  id: string;
  nom: string;
  prenom: string;
  email: string;
}
