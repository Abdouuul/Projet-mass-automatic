import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { LoadingController, AlertController } from '@ionic/angular';
import {AngularFireDatabase} from "@angular/fire/database";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import {ModalModificationPage} from "../modal-modification/modal-modification.page";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})

@NgModule({
  imports:[ CommonModule ],
})

export class ModalPage implements OnInit {
  machine_send;
  archived: boolean;
  constructor(
    public modalController: ModalController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public afSG: AngularFireStorage,
    public afDB: AngularFireDatabase,
    public actionSheetCtlr: ActionSheetController,

  ) {}

  ngOnInit() {
  }

  async presentModal(machine) {
    await this.dismiss();
    const modal = await this.modalController.create({
      component: ModalModificationPage,
      cssClass: 'my-custom-class',
      componentProps: {
        machine_send: machine,
      }
    });
    return await modal.present();
  }


  async dismiss() {
    await this.modalController.dismiss({
      'dismissed': true
    });
  }
}
