import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../cores/guards/auth.guard';
import { PagesPage } from './pages.page';

const routes: Routes = [
  {
    path: '',
    component: PagesPage,
    children: [
      {
        path: '',
        redirectTo: 'article-list',
        pathMatch: 'full'
      },
      {
        path: 'article-list',
        loadChildren: () => import('./article-list/article-list.module').then(m => m.ArticleListPageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: 'article-list',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule),
    canActivate:[AuthGuard]
  },
  {
    path: 'article',
    loadChildren: () => import('./article-list/article/article.module').then( m => m.ArticlePageModule),
    canActivate:[AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PagesPageRoutingModule {}
