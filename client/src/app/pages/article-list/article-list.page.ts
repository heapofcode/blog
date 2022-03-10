import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IArticle } from 'src/app/cores/models/article';
import { ICategory } from 'src/app/cores/models/category';
import { ITag } from 'src/app/cores/models/tag';
import { AuthService } from 'src/app/cores/services/auth.service';
import { StateService } from 'src/app/cores/services/state.service';
import { ArticlePage } from './article/article.page';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.page.html',
  styleUrls: ['./article-list.page.scss'],
})
export class ArticleListPage {

  tags: ITag[];
  categories: ICategory[];
  filterShow:boolean = false;
  isAuthenticated:boolean;
  displayedColumns: string[] = ['heroImage', 'name', 'shortDescription', 'category'];
  articleSource: MatTableDataSource<IArticle> = new MatTableDataSource<IArticle>();
  dataSource: Observable<any>;
  filterForm:FormGroup;

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('search', { static: true }) search:IonSearchbar;

  constructor(
    private auth:AuthService,
    private state:StateService,
    private modalCtrl:ModalController,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      category:[null],
      tags: [null],
      dateFrom: [null],
      dateTo: [null],
      name:null,
      shortDescription:null
    });

    this.auth.isAuthenticated.pipe(
      filter(val => val !== null)
    ).subscribe(isAuthenticated=>
    {
      this.isAuthenticated = isAuthenticated;
    })

    this.state.articles$.subscribe(
      (articles:IArticle[])=>{
        this.articleSource.data = articles;
        this.articleSource._updateChangeSubscription();
      }
    )

    this.state.tags$.subscribe(
      (tags:ITag[])=>{
        this.tags = tags
      }
    )

    this.state.categories$.subscribe(
      (categories:ICategory[])=>{
        this.categories = categories
      }
    )
  }

  scroll = async () => {
    const content = document.querySelector('ion-content');
    const styles = document.createElement('style');

    styles.textContent = `
      ::-webkit-scrollbar {
        width: 12px;
      }

      ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
        background: #fff;
      }

      ::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #f7f7f7;
      }
    `;
    content.shadowRoot.appendChild(styles);
  };

  ionViewWillEnter(){
    this.articleSource.paginator = this.paginator;
    this.dataSource = this.articleSource.connect();
    this.articleSource.filterPredicate = this.createFilter();

    setTimeout(()=>{
      this.scroll();
    }, 250);
  }

  toggleFilter(){
    this.filterShow = !this.filterShow;
  }

  resetFilter(){
    this.filterForm.reset();
    this.search.value = '';
    this.articleSource.filter = '';
  }

  applyFilter(){
    this.articleSource.filter = JSON.stringify(this.filterForm.value)
  }

  createFilter() {
    let filterFunction = function (data: IArticle, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col] !== null) {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      let search = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            if(col==='tags'){
              if(data.tags.filter(e=>{ return searchTerms[col].some(f=>{ return e.id === f.id}) }).length && isFilterSet){
                found = true
              }
            } else if (col==='category'){
                if (data[col].id.includes(searchTerms[col].id) && isFilterSet) {
                  found = true
                }
            } else if (col==='dateFrom' || col==='dateTo'){
                if(new Date(searchTerms['dateFrom']).getTime()
                  <= new Date(data['date']).getTime()
                  && searchTerms['dateTo'] === undefined && isFilterSet
                ){
                  found = true
                }else if (new Date(searchTerms['dateFrom']).getTime()
                          <= new Date(data['date']).getTime() &&
                          new Date(data['date']).getTime()
                          <= new Date(searchTerms['dateTo']).getTime()+86400000 && isFilterSet){
                  found = true
                }
            }
            else {
              if(data[col].toLowerCase().includes(searchTerms[col].toLowerCase()) && isFilterSet){
                found = true
              }
            }
          }
          return found
        } else {
          return true;
        }
      }
      return search()
    }
    return filterFunction
  }

  async article(article:IArticle = null){
    const modal = await this.modalCtrl.create({
      component: ArticlePage,
      cssClass: 'small-modal',
      swipeToClose: true,
      componentProps:{
        article
      }
    });

    await modal.present();
  }

  searchbarChange(e: any) {
    var val = e.detail.value;
    if(val===''){
      val=null;
    }
    this.filterForm.patchValue({
      name:val,
      shortDescription:val
    })
    this.articleSource.filter = JSON.stringify(this.filterForm.value)
  }

  get category() {
    return this.filterForm.get('category');
  }

  get tag() {
    return this.filterForm.get('tags');
  }

  get dateFrom(){
    return this.filterForm.get('dateFrom');
  }

  get dateTo(){
    return this.filterForm.get('dateTo');
  }

}
