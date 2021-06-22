import { Component } from '@angular/core';
import {Machine} from "../models/machines.model";
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  ToastController
} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/firestore";
import firebase from "firebase";
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import {AngularFireStorage} from "@angular/fire/storage";
import {AngularFireDatabase} from "@angular/fire/database";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  machine = {} as Machine;
  machines: any[];
  machinesBackup: any[];

  image;



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

            };
          });
          this.machinesBackup = this.machines;
        });
      await loader.dismiss();
    } catch (e) {
      this.showToast(e);
    }

  }

  getImagesStorageMachine(){
    let storage = firebase.storage();
    let  listRef = storage.ref().child(this.machine.id);
    listRef.listAll()
      .then((res) => {
        res.items.forEach((itemRef) => {
          this.afSG.ref(itemRef.fullPath).getDownloadURL().subscribe(imgUrl => {
            console.log('this.afSG.ref(itemRef.fullPath) : ' , this.afSG.ref(itemRef.fullPath));
            this.image.push(imgUrl);
          });
        })
        console.log('this.images = ',this.image);
      });
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

