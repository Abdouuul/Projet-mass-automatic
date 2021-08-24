import { Component } from '@angular/core';
import {Machine} from "../models/machines.model";
import {AlertController, LoadingController, ModalController, NavController, ToastController, ActionSheetController} from "@ionic/angular";
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
  FilterChoice = null;
  OrderChoice = null;

  constructor(private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private actionsheetCtrl: ActionSheetController,
              private alertController: AlertController,
              private firestore: AngularFirestore,
              public afSG: AngularFireStorage,
              private navCtrl: NavController,
              public modalController: ModalController) {}

  ngOnInit(){

  }

  ionViewWillEnter(){
    this.getMachines().then();
    delete this.FilterChoice;
    delete this.OrderChoice;
  }


  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 2500
    }).then(toastData => toastData.present());
  }

  async getMachines(): Promise<any> {
    let loader = await this.loadingCtrl.create({
      message: 'Attendez...'
    });
    await loader.present();
    try {
      this.firestore
        .collection('machines')
        .snapshotChanges()
        .subscribe(data => {
          this.machines = data.map( e => {
            return {
              type: e.payload.doc.data()['type'],
              fabriquant: e.payload.doc.data()['fabriquant'],
              nom: e.payload.doc.data()['nom'],
              model: e.payload.doc.data()['model'],
              dateAte: e.payload.doc.data()['date_atelier'],
              etat: e.payload.doc.data()['etat'],
              problem: e.payload.doc.data()['problem'],
              dateAjout: e.payload.doc.data()['dateAjout'],
              prefCl: e.payload.doc.data()['prefCl'],
              nomCl: e.payload.doc.data()['nomCl'],
              prixachete: e.payload.doc.data()['prix_achete'],
              docID: e.payload.doc.id,
              travailleff: e.payload.doc.data()['travaillEff'],
              image_ad: e.payload.doc.data()['image_ad'],
            };
          })
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
      header: 'Voulez-vous supprimer cette machine? ',
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
              this.afSG.ref('MachinesProfilePics/'+delMachine.docID+'.jpg').delete();
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
        archived: false,
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
      if(currentMachine.nom && currentMachine.nomCl && searchTerm){
        return (currentMachine.nom.toLowerCase().indexOf(searchTerm.toLowerCase())> -1 ||
        currentMachine.nomCl.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
      }else{
        return (currentMachine.nom.toLowerCase().indexOf(searchTerm.toLowerCase())> -1)
      }
    });
  }

  ajouter(){
    this.navCtrl.navigateRoot('tab2').then();
  }

  doRefresh(event) {
    this.getMachines().then();
    delete this.FilterChoice;
    delete this.OrderChoice;

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  filterByType(searchTerm){
    this.machines = this.machinesBackup;
    this.machines = this.machines.filter(currentMachine => {
      if(currentMachine.type && searchTerm){
        return (currentMachine.type.toLowerCase().indexOf(searchTerm.toLowerCase())> -1)
      }
    });
  }
  FilterData(){
    const choix = this.OrderChoice;
    console.log(choix);
    if(choix === "Croissant") {
      this.machines.sort((n1, n2) => {
        if (n1.dateAte > n2.dateAte) {
          return 1;
        }
        if (n1.dateAte < n2.dateAte) {
          return -1;
        }
        return 0;
      });
    }else if(choix === "Décroissant"){
      this.machines.sort((n1, n2) => {
        if (n1.dateAte < n2.dateAte) {
          return 1;
        }
        if (n1.dateAte > n2.dateAte) {
          return -1;
        }
        return 0;
      });
    }else{
      return this.machines;
    }
  }


  archiver(machine){
    this.firestore.collection('machines').doc(machine.docID).delete();
    if(machine.image_ad != undefined){
      this.firestore.collection("archives").add({
        image_ID: machine.docID,
        type: machine.type,
        fabriquant: machine.fabriquant,
        model: machine.model,
        etat: machine.etat,
        nom: machine.nom,
        nomCl: machine.nomCl,
        prefCl: machine.prefCl,
        prix_achete: machine.prixachete,
        problem: machine.problem,
        travaillEff: machine.travailleff,
        image_ad: machine.image_ad
      });
      this.showToast('Machine Archivée!');
    }else{
      this.firestore.collection("archives").add({
        image_ID: machine.docID,
        type: machine.type,
        fabriquant: machine.fabriquant,
        model: machine.model,
        etat: machine.etat,
        nom: machine.nom,
        nomCl: machine.nomCl,
        prefCl: machine.prefCl,
        prix_achete: machine.prixachete,
        problem: machine.problem,
        travaillEff: machine.travailleff,
        image_ad: null
      });

      this.showToast('Machine Archivée!');
    }
  }
  async Ordering() {
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Ordre',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Du plus anien au plus récent',
        role: 'confirm',
        icon: 'arrow-up',
        handler: () => {
          this.OrderChoice ='Croissant';
          this.FilterData();
        }
      }, {
        text: 'Du plus récent au plus ancien',
        role: 'confirm',
        icon: 'arrow-down',
        handler: () => {
          this.OrderChoice ='Décroissant';
          this.FilterData();
        }
      },
        {
          text: 'Fermer',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
  }



  async filtering(){
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Filtrer',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Flipper',
        role: 'confirm',
        handler: () => {
          this.FilterChoice ='Flipper';
          this.filterByType(this.FilterChoice);
        }
      }, {
        text: 'Juke Box',
        role: 'confirm',
        handler: () => {
          this.FilterChoice = 'Juke Box';
          this.filterByType(this.FilterChoice);        }
      },
        {
          text: 'BabyFoot',
          role: 'confirm',
          handler: () => {
            this.FilterChoice = 'BabyFoot'
            this.filterByType(this.FilterChoice);          }
        },{
          text: 'Jeu de Fléchettes',
          role: 'confirm',
          handler: () => {
            this.FilterChoice = 'Jeu de Fléchettes'
            this.filterByType(this.FilterChoice);          }
        },{
          text: 'Borne d\'arcade',
          role: 'confirm',
          handler: () => {
            this.FilterChoice = 'Borne d\'arcade'
            this.filterByType(this.FilterChoice);          }
        }, {
          text: 'Fermer',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
  }
}

