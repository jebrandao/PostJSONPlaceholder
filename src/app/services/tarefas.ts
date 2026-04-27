import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tarefa } from '../models/tarefas';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {

  private http = inject(HttpClient);
  private api = 'https://jsonplaceholder.typicode.com/posts';

  criar(tarefa: Tarefa) {
    return this.http.post<Tarefa>(this.api, tarefa);
  }

}