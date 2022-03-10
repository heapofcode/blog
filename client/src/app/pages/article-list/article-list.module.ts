import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticleListPageRoutingModule } from './article-list-routing.module';

import { ArticleListPage } from './article-list.page';
import { MaterialExampleModule } from 'src/app/material/material.module';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ArticleListPageRoutingModule,
    MaterialExampleModule,
    IonCustomScrollbarModule
  ],
  declarations: [ArticleListPage]
})
export class ArticleListPageModule {}
