import { Component } from '@angular/core';
import {Machine} from "../models/machines.model";
import {
  AlertController,
  LoadingController,
  ModalController, NavController,
  ToastController
} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFireStorage} from "@angular/fire/storage";
import firebase from "firebase";
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  machine = {} as Machine;
  machines: any[];
  machinesBackup: any[];
  nbrMachines;
  result;


  constructor(private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertController: AlertController,
              private firestore: AngularFirestore,
              public afSG: AngularFireStorage,
              private navCtrl: NavController,
              public modalController: ModalController) {}

  ngOnInit(){

  }

  ionViewWillEnter(){
    this.getMachines().then();
  }


  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).then(toastData => toastData.present());
  }

  async getMachines(): Promise<any> {
    let loader = await this.loadingCtrl.create({
      message: 'Please wait ...'
    });
    await loader.present();
    try {

      this.firestore
        .collection('machines')
        .snapshotChanges()
        .subscribe(data => {
          this.machines = data.map(e => {
            return {
              type: e.payload.doc.data()['type'],
              fabriquant: e.payload.doc.data()['fabriquant'],
              nom: e.payload.doc.data()['nom'],
              model: e.payload.doc.data()['model'],
              dateAte: e.payload.doc.data()['date_atelier'],
              etat: e.payload.doc.data()['etat'],
              docID: e.payload.doc.id,
              image_ad: e.payload.doc.data()['image_ad'],
            };
          });
          console.log(this.machines);
          this.nbrMachines = this.machines.length;
          this.machinesBackup = this.machines;
        });
      await loader.dismiss();
    } catch (e) {
      this.showToast(e);
    }
  }
  async AlertConfirm() {
    delete this.result;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Êtes-vous sûr de vouloir supprimer cette machine? ',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Oui',
          role: 'confirm',
          handler: () => {

          }
        }
      ]
    });
    await alert.present();
    return true;
  }

  async deleteMachine(delMachine) {
    if( await this.AlertConfirm()){
      await this.firestore.collection('machines').doc(delMachine.docID).delete();
      if(delMachine.image_ad != null){
        await this.afSG.ref('MachinesProfilePics/'+delMachine.docID).delete();
      }
      console.log(delMachine);
    }
  }

    filterList(event) {
    this.machines = this.machinesBackup;
    const searchTerm = event.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.machines = this.machines.filter(currentMachine => {
      if (currentMachine.nom && searchTerm) {
        return (currentMachine.nom.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
          || currentMachine.type.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
      }
    });
  }

  ajouter(){
    this.navCtrl.navigateRoot('tab2');
  }
}

