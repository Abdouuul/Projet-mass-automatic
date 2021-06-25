import { Component } from '@angular/core';
import {Machine} from "../models/machines.model";
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController
} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFireStorage} from "@angular/fire/storage";
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  machine = {} as Machine;
  machines: any[];
  machinesBackup: any[];
  machine_id;
  downloadURL;


  constructor(private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertController: AlertController,
              private firestore: AngularFirestore,
              public afSG: AngularFireStorage,
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
          this.machinesBackup = this.machines;
        });
      await loader.dismiss();
    } catch (e) {
      this.showToast(e);
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
}

