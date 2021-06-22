import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { AngularFireStorage } from '@angular/fire/storage';
import { LoadingController, AlertController } from '@ionic/angular';

import { Observable } from 'rxjs';
import {AngularFireDatabase} from "@angular/fire/database";
import firebase from "firebase";

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})

@NgModule({
  imports:      [ CommonModule ],
})

export class ModalPage implements OnInit {
  machine_send;
  image;
  images = [];
  imagePath: string;
  upload: any;
  del: any; //delete image
  items: Observable<any[]>;
  file;

  constructor(
    public modalController: ModalController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public afSG: AngularFireStorage,
    public afDB: AngularFireDatabase,
    private camera: Camera,
    public actionSheetCtlr: ActionSheetController,

  ) {}

  ngOnInit() {
    this.getImagesStorageMachine();
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async addPhoto(source: string) {
    if (source === 'library') {
      console.log('library');
      const libraryImage = await this.openLibrary();
      this.image = 'data:image/jpg;base64,' + libraryImage;
      console.log("addPhoto : this.image.id = " + this.image.id);
    } else {
      console.log('camera');
      const cameraImage = await this.openCamera();
      this.image = 'data:image/jpg;base64,' + cameraImage;
      console.log("addPhoto : this.image.id = " + this.image.id);
    }
    this.presentAlertConfirm();
  }

  async openCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: this.camera.PictureSourceType.CAMERA
    };
    return await this.camera.getPicture(options);
  }

  async openLibrary() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };
    return await this.camera.getPicture(options);
  }

  async uploadFirebase() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.imagePath = this.machine_send.id +'/' + new Date().getTime() + '.jpg';
    this.upload = this.afSG.ref(this.imagePath).putString(this.image, 'data_url');

    this.upload.then(async () => {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Upload réussi !',
        message: 'L\'envoi de la photo dans Firebase est terminé!',
        buttons: ['OK']
      });
      await alert.present();
      this.getImagesStorageMachine();

    });
  }

  getImagesStorageMachine() {
    var storage = firebase.storage();
    var listRef = storage.ref().child(this.machine_send.id);
    listRef.listAll()
      .then((res) => {
        res.items.forEach((itemRef) => {
          this.afSG.ref(itemRef.fullPath).getDownloadURL().subscribe(imgUrl => {
            console.log('this.afSG.ref(itemRef.fullPath) : ' , this.afSG.ref(itemRef.fullPath));
            this.images.push(imgUrl);
          });
        })
        console.log('this.images = ',this.images);
      });
  }


  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtlr.create({
      header: 'Ajouter une photo',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'à partir de la bibliotheque',
        role: 'addPhoto(\'library\')',
        icon: 'image',
        handler: () => {
          this.addPhoto('library');
          console.log('Open library clicked');
        }
      }, {
        text: 'à partir de l\'appareil photo',
        role: 'addPhoto(\'camera\')',
        icon: 'camera',
        handler: () => {
          this.addPhoto('camera');
          console.log('Open camera clicked');
        }
      },
        {
          text: 'Fermer',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Voulez-vous ajouter cette photo ? ',
      message: `<img src="${this.image}" alt="g-maps" style="border-radius: 2px">`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Annuler');
          }
        }, {
          text: 'Ajouter',
          handler: () => {
            console.log('Confirm Ajouter');
            this.uploadFirebase();
          }
        }
      ]
    });
    await alert.present();
  }

  async presentAlertDelete(i) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Voulez-vous supprimer cette photo ? ',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Annuler');
          }
        }, {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'primary',
          handler: () => {
            this.deleteImg(i);
            console.log('i dans presentAlertDelete(i) : ', i);
            console.log('Delete clicked');
          }
        },
      ]
    });
    await alert.present();
  }

  async deleteImg(i): Promise<void> {
    const loading = await this.loadingController.create();
    await loading.present();
    this.del = this.afSG.storage.refFromURL(this.images[i]).delete();
    if (i > -1) {
      this.images.splice(i, 1);
    }
    this.del.then(async () => {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Suppression réussi !',
        message: 'La photo a bien été supprimée dans Firebase.',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
}
