import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalModificationPage } from './modal-modification.page';

const routes: Routes = [
  {
    path: '',
    component: ModalModificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalModificationPageRoutingModule {}
