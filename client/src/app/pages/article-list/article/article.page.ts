import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { IArticle } from 'src/app/cores/models/article';
import { ICategory } from 'src/app/cores/models/category';
import { ITag } from 'src/app/cores/models/tag';
import { AuthService } from 'src/app/cores/services/auth.service';
import { CameraService } from 'src/app/cores/services/camera.service';
import { StateService } from 'src/app/cores/services/state.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
})
export class ArticlePage {
  articleForm: FormGroup;
  tags: ITag[];
  categories: ICategory[];
  readonly: string;
  disabled: boolean;
  title: string = 'Новая запись';
  mode:string = 'create';

  @Input() article: IArticle;

  constructor(
    private fb: FormBuilder,
    private state: StateService,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private camera:CameraService
  ) {
    this.articleForm = this.fb.group({
      id:'',
      name: ['', [Validators.required]],
      shortDescription: ['', [Validators.required]],
      description: ['', [Validators.required]],
      heroImage: [''],
      category: [null, Validators.required],
      tags: [null],
    });

    this.auth.isAuthenticated
      .pipe(filter((val) => val !== null))
      .subscribe((isAuthenticated) => {
        !isAuthenticated
          ? ((this.readonly = 'readonly'),
            this.articleForm.controls['category'].disable(),
            this.articleForm.controls['tags'].disable())
          : (this.articleForm.controls['category'].enable(),
            this.articleForm.controls['tags'].enable());
      });

    this.state.categories$.subscribe((categories: ICategory[]) => {
      this.categories = categories;
    });

    this.state.tags$.subscribe((tags: ITag[]) => {
      this.tags = tags;
    });
  }

  async image(){
    if(!this.readonly){
      const image = await this.camera.selectImage();
      if(image){
        this.articleForm.patchValue({
          heroImage:image
        })
      }
    }
  }

  ionViewWillEnter() {
    if (this.article) {
      // this.title = this.article.name;
      this.title = '';
      this.mode = 'update'
      this.articleForm.patchValue(this.article);
    }

  }

  compareTags(object1: any, object2: any) {
    return object1 && object2 && object1.name == object2.name;
  }

  compareCategory(object1: any, object2: any) {
    return object1 && object2 && object1.name == object2.name;
  }

  remove(){
    this.state.stateCRUD('remove', 'articles', '', this.articleForm.controls['id'].value);
    this.modalCtrl.dismiss();
  }

  save() {
    if(this.mode === 'create') this.articleForm.removeControl('id');
    this.state.stateCRUD(this.mode, 'articles', this.articleForm.value);
    this.modalCtrl.dismiss();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  get category() {
    return this.articleForm.get('category');
  }

  get tag() {
    return this.articleForm.get('tags');
  }
}
