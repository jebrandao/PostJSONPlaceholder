import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TarefaService } from './services/tarefas';
import { Tarefa } from './models/tarefas';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private tarefaService = inject(TarefaService);

  loading = signal(false);
  sucesso = signal('');
  erro = signal('');
  tarefaCriada = signal<Tarefa | null>(null);

  form = new FormGroup({
    titulo: new FormControl('', Validators.required),
    descricao: new FormControl('', Validators.required),
    prioridade: new FormControl('media', Validators.required),
    categoria: new FormControl('', Validators.required),
    status: new FormControl('pendente', Validators.required),
    dataLimite: new FormControl('', Validators.required)
  });

  salvar() {
    if (this.form.invalid) {
      this.erro.set('Preencha todos os campos.');
      return;
    }

    this.loading.set(true);
    this.erro.set('');
    this.sucesso.set('');
    this.tarefaCriada.set(null);

    const payload = this.form.getRawValue() as Tarefa;

    this.tarefaService.criar(payload).subscribe({
      next: (resposta) => {
        this.loading.set(false);

        this.sucesso.set('Tarefa cadastrada com sucesso!');
        this.tarefaCriada.set(resposta);

        this.form.reset({
          prioridade: 'media',
          status: 'pendente'
        });
      },

      error: () => {
        this.loading.set(false);
        this.erro.set('Erro ao salvar tarefa.');
      }
    });
  }
}