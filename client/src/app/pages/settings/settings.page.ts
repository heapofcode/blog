import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ICategory } from 'src/app/cores/models/category';
import { ITag } from 'src/app/cores/models/tag';
import { StateService } from 'src/app/cores/services/state.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  categories:ICategory[];
  tags:ITag[];

  @ViewChild('matInput') matInput

  constructor(
    private state:StateService,
    private modalCtrl:ModalController
  ) {
    this.state.categories$.subscribe((categories:ICategory[])=>{
      this.categories = categories;
    })

    this.state.tags$.subscribe((tags:ITag[])=>{
      this.tags = tags;
    })
  }

  close(){
    this.modalCtrl.dismiss();
  }
}
