import firebase from "firebase";
import Timestamp = firebase.firestore.Timestamp;

export interface Client{
  id: string;
  nom: string;
  prenom: string;
  type: string;
  tel: string;
  mail: string;
  ville: string;
  problem: string;
}
