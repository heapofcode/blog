import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter} from 'rxjs/operators'
import { IArticle } from '../models/article';
import { ICategory } from '../models/category';
import { ITag } from '../models/tag';
import { HttpService } from './http.service';

export class BehaviorSubjectItem<T> {
  asObservable(): Observable<any> {
    throw new Error('Method not implemented.');
  }
  readonly subject: BehaviorSubject<T>
  readonly value$: Observable<T>

  get value(): T {
    return this.subject.value
  }

  set value(value: T) {
    this.subject.next(value)
  }

  constructor(initialValue: T) {
    this.subject = new BehaviorSubject(initialValue)
    this.value$ = this.subject.asObservable()
  }
}

export interface Initial
{
  articles:IArticle[]
  tags:ITag[]
  categories:ICategory[]
}

const INITIAL:Initial = {
  articles: undefined,
  tags: undefined,
  categories: undefined
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state: BehaviorSubjectItem<Initial> = new BehaviorSubjectItem(INITIAL);
  state$ =this.state.value$;

  constructor(
    private httpService:HttpService,
    private loadingController: LoadingController,
    private alertController:AlertController
  )
  {
    this.initial();
  }

  async initial(){
    const loading = await this.loadingController.create({
      mode:'ios',
      cssClass:'loader-css-class',
    });
    await loading.present();


    this.httpService.query().subscribe(
      async res=>{
        var articles = <IArticle[]>res[0];
        var tags = <ITag[]>res[1];
        var categories = <ICategory[]>res[2];

        const _state = this.state.value
        this.state.value = {
          ... _state,
          articles, tags, categories
        },
        await loading.dismiss();
      },
      async error=>{
        await loading.dismiss();
      }
    )
  }

  articles$: Observable<IArticle[]> = this.state.value$.pipe(
    filter(val=>val.articles !== undefined),
    map(state => state.articles)
  )

  categories$: Observable<ICategory[]> = this.state.value$.pipe(
    filter(val=>val.categories !== undefined),
    map(state => state.categories)
  )

  tags$: Observable<ITag[]> = this.state.value$.pipe(
    filter(val=>val.tags !== undefined),
    map(state => state.tags)
  )

  async stateCRUD(mode:string, controller:string, data:any, id:string = ''){
    const loading = await this.loadingController.create({
      mode:'ios',
      cssClass:'loader-css-class',
    });
    await loading.present();

    var crud;
    if(mode === "create" || mode === "update"){
      crud = this.httpService.saveOrupdate(mode, controller, data)
    } else if (mode === "remove")
    {
      crud = this.httpService.remove(controller, id)
    }

    crud.subscribe(
      async _=>{
        this.initial();
        await loading.dismiss();
      },
      async error=>{
        await loading.dismiss();

        const alert = await this.alertController.create({
          header: 'Ошибка',
          message: error.error.text,
          buttons: [{ text: 'Ок', handler:(_)=>{

          }}],
        });

        await alert.present();

        // console.log(error.error.text)
      }
    )
  }
}
