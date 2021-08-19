import { Component,OnInit } from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {NavController, ToastController, ModalController} from "@ionic/angular";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  connexionForm = this.formBuilder.group({
    email: [''],
    password: [''],
  })

  constructor(
    public afAuth: AngularFireAuth,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public modalController: ModalController
  ) {}

  ngOnInit() {}



  async logIn() {
    console.log(this.connexionForm.value.email);
    console.log(this.connexionForm.value.password);
    try {
      // login user with email and password
      await this.afAuth
        .signInWithEmailAndPassword(this.connexionForm.value.email, this.connexionForm.value.password)
        .then(data => {
          console.log(data);
          this.navCtrl.navigateRoot('home');
        });
    } catch (e) {
      this.showToast(e);
    }
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 2500
    }).then(toastData => toastData.present());
  }


}
