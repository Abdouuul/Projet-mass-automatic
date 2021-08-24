import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalModificationPageRoutingModule } from './modal-modification-routing.module';

import { ModalModificationPage } from './modal-modification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalModificationPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ModalModificationPage],
  providers: [ReactiveFormsModule]
})
export class ModalModificationPageModule {}
