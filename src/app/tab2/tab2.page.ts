import { Component } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {FormBuilder} from '@angular/forms';

import {
  LoadingController,
  NavController,
  ToastController,
  AlertController,
  ActionSheetController
} from '@ionic/angular';
import {Machine} from "../models/machines.model";
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import {AngularFireStorage} from "@angular/fire/storage";
import {AngularFireDatabase} from "@angular/fire/database";

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  machine = {} as Machine;
  imagePath;
  image;
  machine_id;
  upload: any;

  AjoutMachine = this.formBuilder.group({
    type: [''],
    fabriquant: [''],
    model: [''],
    etat: [''],
    prixachete: [''],
    problem: [''],
    dateAte: [''],
    nom: [''],
    prefCl:[''],
    nomCl: [''],
    travaillEff:['']

  })

  constructor(private formBuilder: FormBuilder,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private firestore: AngularFirestore,
              public afSG: AngularFireStorage,
              public afDB: AngularFireDatabase,
              private camera: Camera,
              public actionSheetCtlr: ActionSheetController,
              private navCtrl: NavController
              ) {}

  ngOnIni(){

  }

  ionViewWillEnter(){
    this.AjoutMachine.reset();
    if(this.image != null){
      delete this.image;
    }
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).then(toastData => toastData.present());
  }
  convert(new_form) {
    let new_machine = {} as Machine;
    new_machine.type = new_form.type;
    new_machine.nom = new_form.nom;
    new_machine.model = new_form.model;
    new_machine.fabriquant = new_form.fabriquant;
    new_machine.etat = new_form.etat;
    new_machine.date_atelier = new_form.dateAte;
    new_machine.prix_achete = new_form.prixachete;
    new_machine.problem = new_form.problem;
    new_machine.nomCl = new_form.nomCl;
    new_machine.prefCl = new_form.prefCl;
    new_machine.travaillEff = new_form.travaillEff;
    new_machine.dateAjout = new Date().toLocaleString();

    return new_machine;
  }

  async submit() {
      this.machine = this.convert(this.AjoutMachine.value);
      let loader = await this.loadingCtrl.create({
        message: "Please wait..."
      });
      await loader.present();
      try {
        await this.firestore.collection("machines").add(this.machine)
          .then(machineRef =>{
            this.machine_id = machineRef.id;
          })

      }catch (e) {
        this.showToast(e);
        return 0;
      }
      await loader.dismiss();
      return 1;
    }

  async addPhoto(source: string) {
    if (source === 'library') {
      const libraryImage = await this.openLibrary();
      this.image = 'data:image/jpg;base64,' + libraryImage;
    } else {
      const cameraImage = await this.openCamera();
      this.image = 'data:image/jpg;base64,' + cameraImage;
    }
    await this.presentAlertConfirm();
  }

  async uploadFirebase() {
   if(await this.submit() && this.image != null){
     const loading = await this.loadingCtrl.create();
     await loading.present();
     this.imagePath = 'MachinesProfilePics'+'/' +this.machine_id+'.jpg';
     this.upload = this.afSG.ref(this.imagePath).putString(this.image, 'data_url');
     this.upload.then(async () => {
       await loading.dismiss();



       const alert = await this.alertCtrl.create({
         header: 'Upload réussi !',
         message: 'La machine a bien été ajouté!',
         buttons: ['OK']
       });
       await alert.present();
       await this.getMachineProfilePicture(this.machine_id);
       this.AjoutMachine.reset();
     });
   }
    await this.navCtrl.navigateRoot('home');
  }

  async openCamera() {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation:true,
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
      correctOrientation:true,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };
    return await this.camera.getPicture(options);
  }

  async getMachineProfilePicture(machineID: string){
    this.afSG.ref('MachinesProfilePics/'+machineID+'.jpg').getDownloadURL().subscribe(imgurl => {
      if (this.image != null && typeof imgurl != "undefined"){
        this.firestore.doc('machines/' + machineID).update({
          image_ad:imgurl,
        })
      }
    })
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
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Voulez-vous ajouter cette photo ? ',
      message:`<img src="${this.image}" alt="g-maps" style="border-radius: 2px">`,
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
          }
        }
      ]
    });
    await alert.present();
  }
}
