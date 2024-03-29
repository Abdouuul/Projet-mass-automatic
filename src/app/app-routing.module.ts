import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo, canActivate} from "@angular/fire/auth-guard";
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['home']);

const routes: Routes = [

  {
    path:'',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path:'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToDashboard)
  },
 {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },

  {
    path: 'home',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path:'tab2',
    loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'modal-modification',
    loadChildren: () => import('./modal-modification/modal-modification.module').then( m => m.ModalModificationPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
