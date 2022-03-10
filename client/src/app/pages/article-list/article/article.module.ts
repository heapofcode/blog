import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticlePageRoutingModule } from './article-routing.module';

import { ArticlePage } from './article.page';
import { MaterialExampleModule } from 'src/app/material/material.module';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ArticlePageRoutingModule,
    MaterialExampleModule,
    IonCustomScrollbarModule
  ],
  declarations: [ArticlePage]
})
export class ArticlePageModule {}
