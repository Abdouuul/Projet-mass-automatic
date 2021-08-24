import { Component, OnInit } from '@angular/core';
import {Machine} from "../models/machines.model";
import {FormBuilder} from "@angular/forms";
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  ToastController
} from "@ionic/angular";
import {AngularFireStorage} from "@angular/fire/storage";
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFirestore} from "@angular/fire/firestore";

@Component({
  selector: 'app-modal-modification',
  templateUrl: './modal-modification.page.html',
  styleUrls: ['./modal-modification.page.scss'],
})
export class ModalModificationPage implements OnInit {

  machine_send;
  machine = {} as Machine;

  constructor(
    public formBuilder: FormBuilder,
    public modalController: ModalController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public afSG: AngularFireStorage,
    public afDB: AngularFireDatabase,
    private firestore: AngularFirestore,
    public toastCtrl: ToastController,
    public actionSheetCtlr: ActionSheetController,

  ) {}

  ModifMachine = this.formBuilder.group({
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


  ngOnInit(){
    console.log(this.machine_send);
    console.log(this.ModifMachine.value);
    console.log(this.ModifMachine);
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

    return new_machine;
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 2500
    }).then(toastData => toastData.present());
  }

  dismiss(){
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async modifier(machine) {
    this.machine = this.convert(this.ModifMachine.value);
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Veuillez confirmez les modifications ',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Confimer',
          role: 'confirm',
          handler: () => {
            console.log(this.machine_send);
            console.log(this.ModifMachine.value);
            console.log(this.machine);

            this.firestore.collection('machines').doc(machine.docID).set({
              type: this.machine.type,
              fabriquant: this.machine.fabriquant,
              model: this.machine.model,
              etat: this.machine.etat,
              nom: this.machine.nom,
              nomCl: this.machine.nomCl,
              prefCl: this.machine.prefCl,
              prix_achete: this.machine.prix_achete,
              problem: this.machine.problem,
              travaillEff: this.machine.travaillEff,
              date_atelier: this.machine.date_atelier
            }, {merge: true});
            this.showToast('Machine Modifiée!');
            this.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

}
