import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { LoadingController, AlertController } from '@ionic/angular';
import {AngularFireDatabase} from "@angular/fire/database";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

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

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
