import { Component } from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, ToastController} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFireStorage} from "@angular/fire/storage";
import {ModalPage} from "../modal-machine/modal.page";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
archives: any[];
archivesBackUp: any[];
nbrArchives;

  constructor(private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertController: AlertController,
              private firestore: AngularFirestore,
              public afSG: AngularFireStorage,
              public modalController: ModalController) {}

  ionViewWillEnter(){
    this.getArchives().then();
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 2500
    }).then(toastData => toastData.present());
  }

  async getArchives(): Promise<any> {
    let Loader = await this.loadingCtrl.create({
      message: 'Attendez...'
    });
    await Loader.present();
    try {
      this.firestore
        .collection('archives')
        .snapshotChanges()
        .subscribe(data => {
          this.archives = data.map( e => {
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
          });

          this.nbrArchives = this.archives.length;
          this.archivesBackUp = this.archives;
        });
      await Loader.dismiss();
      console.log(this.archives)
    } catch (e) {
      this.showToast('Erreur d\'affichage des machines');
    }
  }

  async presentModal(machine) {
    const modal = await this.modalController.create({
      component: ModalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        machine_send: machine,
        archived: true,
      }
    });
    return await modal.present();
  }
  doRefresh(event) {
    this.getArchives().then();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
  filterList(event) {
    this.archives = this.archivesBackUp;
    const searchTerm = event.target.value;
    if (!searchTerm) {
      return;
    }
    this.archives = this.archives.filter(currentArchive => {
      if(currentArchive.nom && currentArchive.nomCl && searchTerm){
        return (currentArchive.nom.toLowerCase().indexOf(searchTerm.toLowerCase())> -1 ||
          currentArchive.nomCl.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
      }else{
        return (currentArchive.nom.toLowerCase().indexOf(searchTerm.toLowerCase())> -1)
      }
    });
  }
  async AlertConfirmDeleteMachine(delArchive) {
    console.log(delArchive);
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Voulez-vous supprimer cette machine de l\'archive?',
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
            this.firestore.collection('archives').doc(delArchive.docID).delete();
            this.showToast('Machine supprimée de l\'archive!');
          }
        }
      ]
    });
    await alert.present();
  }
}
