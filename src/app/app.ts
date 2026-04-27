import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TarefaService } from './services/tarefa';
import { Tarefa } from './models/tarefa';

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

  tarefas = signal<Tarefa[]>([]);

  form = new FormGroup({
    title: new FormControl('', Validators.required),
    body: new FormControl('', Validators.required)
  });

  constructor() {
    this.carregarTarefas();
  }

  carregarTarefas() {
    this.loading.set(true);
    this.erro.set('');

    this.tarefaService.listar().subscribe({
      next: (dados) => {
        this.tarefas.set(dados.slice(0, 10));
        this.loading.set(false);
      },

      error: () => {
        this.erro.set('Erro ao carregar tarefas.');
        this.loading.set(false);
      }
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.erro.set('Preencha todos os campos.');
      return;
    }

    this.loading.set(true);
    this.erro.set('');
    this.sucesso.set('');

    const payload: Tarefa = {
      userId: 1,
      title: this.form.value.title!,
      body: this.form.value.body!
    };

    this.tarefaService.criar(payload).subscribe({
      next: (resposta) => {
        this.tarefas.update(lista => [
          resposta,
          ...lista
        ]);

        this.sucesso.set('Tarefa criada!');
        this.loading.set(false);
        this.form.reset();
      },

      error: () => {
        this.erro.set('Erro ao criar tarefa.');
        this.loading.set(false);
      }
    });
  }

  editar(tarefa: Tarefa) {
    if (!tarefa.id) return;

    const novaDescricao = prompt(
      'Editar descrição:',
      tarefa.body
    );

    if (!novaDescricao) return;

    this.erro.set('');
    this.sucesso.set('');

    this.tarefaService
      .atualizarParcial(
        tarefa.id,
        { body: novaDescricao }
      )
      .subscribe({
        next: () => {
          this.tarefas.update(lista =>
            lista.map(t =>
              t.id === tarefa.id
                ? {
                    ...t,
                    body: novaDescricao
                  }
                : t
            )
          );

          this.sucesso.set(
            'Descrição atualizada com sucesso!'
          );
        },

        error: () => {
          this.erro.set(
            'Erro ao editar tarefa.'
          );
        }
      });
  }

  concluir(tarefa: Tarefa) {
    if (!tarefa.id) return;

    this.tarefaService
      .atualizarParcial(
        tarefa.id,
        { body: tarefa.body + ' ✅' }
      )
      .subscribe({
        next: (resposta) => {
          this.tarefas.update(lista =>
            lista.map(t =>
              t.id === tarefa.id
                ? resposta
                : t
            )
          );

          this.sucesso.set(
            'Tarefa concluída!'
          );
        }
      });
  }

  excluir(id?: number) {
    if (!id) return;

    if (!confirm('Excluir tarefa?')) return;

    this.tarefaService
      .remover(id)
      .subscribe({
        next: () => {
          this.tarefas.update(lista =>
            lista.filter(t => t.id !== id)
          );

          this.sucesso.set(
            'Tarefa removida!'
          );
        }
      });
  }
}