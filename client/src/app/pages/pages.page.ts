import { Component } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { AuthService } from '../cores/services/auth.service';
import { StateService } from '../cores/services/state.service';
import { LoginPage } from './login/login.page';
import { SettingsPage } from './settings/settings.page';

@Component({
  selector: 'app-pages',
  templateUrl: 'pages.page.html',
  styleUrls: ['pages.page.scss'],
})
export class PagesPage {
  isAuthenticated: boolean;

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private state:StateService
  ) {
    this.auth.isAuthenticated
    .pipe(filter((val) => val !== null))
    .subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  async logout() {
    const loading = await this.loadingController.create({
      mode: 'ios',
      cssClass: 'loader-css-class',
    });
    await loading.present();

    this.auth.logout().subscribe(
      async (res) => {
        await loading.dismiss();
        //this.router.navigateByUrl('/');
      },
      async (res) => {
        await loading.dismiss();
        this.auth.removeToken();
      }
    );
  }

  reload(){
    this.state.initial();
  }

  async login() {
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      cssClass: 'small-modal',
    });

    await modal.present();
  }

  async settings() {
    const modal = await this.modalCtrl.create({
      component: SettingsPage,
      cssClass: 'small-modal',
    });

    await modal.present();
  }

  toggleTheme(event){
    if(event.detail.checked){
      document.body.setAttribute('color-theme','dark');
    } else{
      document.body.setAttribute('color-theme','light');
    }
  }
}
