import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/cores/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalCtrl:ModalController
  ) {
    this.credentials = this.fb.group({
      username: ["admin", [Validators.required]],
      password: ["123456789", [Validators.required, Validators.minLength(5)]]
    });
  }

  async login() {
    const loading = await this.loadingController.create({
      mode:'ios',
      cssClass:'loader-css-class',
    });
    await loading.present();

    this.auth.login(this.credentials.value).subscribe(
      async (res) => {
        await loading.dismiss();
        this.modalCtrl.dismiss();
      },
      async (error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Ошибка входа',
          message: error.error,
          buttons: ['OK'],
        });

        await alert.present();
      }
    );
  }

  close(){
    this.modalCtrl.dismiss();
  }

  get username() {
    return this.credentials.get('username');
  }

  get password() {
    return this.credentials.get('password');
  }
}
