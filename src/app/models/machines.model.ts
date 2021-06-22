import firebase from "firebase";
import Timestamp = firebase.firestore.Timestamp;

export interface Machine{
  id: string;
  type: string;
  nom: string;
  model: string;
  fabriquant: string;
  etat: string;
  date_atelier: string;
  prix_achete: string;
  problem: string;
}
