import { todoRepository } from "@client/repositories/todoRepository";
import { Todo } from "@client/schemas/todo";
import { z as schema } from "zod";

interface TodoControllerGetParams {
  page: number;
}

async function get({ page }: TodoControllerGetParams) {
  return todoRepository.get({
    page: page || 1,
    limit: 10,
  });
}

function filterTodosByContent<T>(
  todos: Array<T & { content: string }>,
  search: string
): Array<T> {
  return todos.filter((todo) =>
    todo.content.toLowerCase().includes(search.toLocaleLowerCase())
  );
}

interface TodoControllerCreateParams {
  content?: string;
  onSuccess: (todo: Todo) => void;
  onError: (customMessage?: string) => void;
}

function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
  const parsedParams = schema.string().min(1).safeParse(content);
  if (!parsedParams.success) {
    onError("Conteúdo não pode ser vazio");
    return;
  }

  todoRepository
    .createByContent(parsedParams.data)
    .then((createdTodo) => {
      onSuccess(createdTodo);
    })
    .catch(() => {
      onError();
    });
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
};
