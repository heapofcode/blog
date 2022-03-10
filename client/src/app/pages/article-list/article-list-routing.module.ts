import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/cores/guards/auth.guard';

import { ArticleListPage } from './article-list.page';

const routes: Routes = [
  {
    path: '',
    component: ArticleListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticleListPageRoutingModule {}
