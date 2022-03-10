import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private url = `${environment.api_url}`

  constructor(
    private http:HttpClient
  ) { }

  query(){
    var articles = this.http.get(`${this.url}/articles`);
    var tags = this.http.get(`${this.url}/tags`);
    var categories = this.http.get(`${this.url}/categories`);
    return forkJoin([articles, tags, categories]);
  }

  saveOrupdate(mode:string, controller:string, data:any){
    const saveOrupdate = (mode === 'update') ? this.http.put(`${this.url}/${controller}`, data) : this.http.post(`${this.url}/${controller}`, data)
    return saveOrupdate;
    // .pipe(
    //   mergeMap(_=>this.http.get(`${this.url}/${controller}`))
    // )
  }

  remove(controller:string, id:string){
    return this.http.delete(`${this.url}/${controller}/${id}`)
    // .pipe(
    //   mergeMap(_=>this.http.get(`${this.url}/${controller}`))
    // );
  }
}
