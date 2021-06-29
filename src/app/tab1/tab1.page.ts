import { Component } from '@angular/core';
import {Machine} from "../models/machines.model";
import {AlertController, LoadingController, ModalController, NavController, ToastController} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFireStorage} from "@angular/fire/storage";
import {ModalPage} from "../modal-machine/modal.page";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  machine = {} as Machine;
  machines: any[];
  machinesBackup: any[];
  machine_send;
  nbrMachines;

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
      duration: 2500
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
          this.nbrMachines = this.machines.length;
          this.machinesBackup = this.machines;
        });
      await loader.dismiss();
    } catch (e) {
      this.showToast('Erreur d\'affichage des machines');
    }
  }
  async AlertConfirmDeleteMachine(delMachine) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Vous-vous supprimer cette machine? ',
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
            this.firestore.collection('machines').doc(delMachine.docID).delete();
            if(delMachine.image_ad != null){
              this.afSG.ref('MachinesProfilePics/'+delMachine.docID).delete();
            }
            this.showToast('Machine Supprimée!');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentModal(machine) {
    const modal = await this.modalController.create({
      component: ModalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        machine_send: machine,
      }
    });
    return await modal.present();
  }

    filterList(event) {
    this.machines = this.machinesBackup;
    const searchTerm = event.target.value;

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
    this.navCtrl.navigateRoot('tab2').then();
  }


}

