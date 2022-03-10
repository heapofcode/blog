import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { StateService } from 'src/app/cores/services/state.service';

@Component({
  selector: 'app-settings-card',
  templateUrl: './settings-card.page.html',
  styleUrls: ['./settings-card.page.scss'],
})
export class SettingsCardPage implements OnInit {
  showContent: boolean;
  form: FormGroup;
  items: any;
  selectedItem;

  @Input() title;
  @Input() subtitle;
  @Input() controller;
  @ViewChild('matInput') matInput;

  constructor(
    private fb: FormBuilder,
    private state: StateService,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      id: [''],
      name: [''],
    });
  }

  ngOnInit() {
    this.state.state$.subscribe((res) => {
      this.items = res[this.controller];
    });
  }

  toggleContent() {
    this.showContent = !this.showContent;
    this.selectedItem = null;
  }

  inputChange(event: string) {
    this.selectedItem = null;
    if (event == '' && this.id) {
      this.form.reset();
    }
  }

  create() {
    this.state.stateCRUD('create', this.controller, { name: this.form.controls['name'].value });
  }

  async edit(item) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Редактирование',
      subHeader: 'Введите новое название',
      inputs: [{ name: 'name', placeholder: 'Название' }],
      buttons: [
        { text: 'Отмена', role: 'cancel' },
        {
          text: 'Обновить',
          handler: (data) => {
            this.state.stateCRUD('update', this.controller, {
              id: item.id,
              name: data.name,
            });
            this.selectedItem = null;
          },
        },
      ],
    });

    await alert.present();
  }

  async remove(id: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Удаление',
      subHeader: 'Вы действительно хотите удалить запись?',
      buttons: [
        { text: 'Отмена', role: 'cancel' },
        {
          text: 'Удалить',
          handler: (_) => {
            this.state.stateCRUD('remove', this.controller, null, id);
            this.selectedItem = null;
          },
        },
      ],
    });

    await alert.present();
  }

  select(item) {
    this.matInput.nativeElement.focus();
    this.form.setValue({
      id: item.id,
      name: item.name,
    });
  }

  clear() {
    this.form.reset();
  }

  get id() {
    return this.form.get('id');
  }

  get name() {
    return this.form.get('name');
  }
}
