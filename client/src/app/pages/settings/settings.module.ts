import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { MaterialExampleModule } from 'src/app/material/material.module';
import { SettingsCardPage } from './settings-card/settings-card.page';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    ReactiveFormsModule,
    MaterialExampleModule,
    IonCustomScrollbarModule
  ],
  declarations: [SettingsPage, SettingsCardPage]
})
export class SettingsPageModule {}
