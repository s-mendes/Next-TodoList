import { Todo, TodoSchema } from "@client/schemas/todo";
import { z as schema } from "zod";

interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}
interface TodoReporitoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoReporitoryGetOutput> {
  return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (respostaDoServidor) => {
      const todosString = await respostaDoServidor.text();
      const responseParsed = parseTodosFromServer(JSON.parse(todosString));

      return {
        todos: responseParsed.todos,
        total: responseParsed.total,
        pages: responseParsed.pages,
      };
    }
  );
}

async function createByContent(content: string): Promise<Todo> {
  return fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  }).then(async (serverResponse) => {
    const todoString = await serverResponse.text();
    const todoFromServer = JSON.parse(todoString);

    if (!serverResponse.ok) {
      throw new Error(todoFromServer.message);
    }

    const todoSchema = schema.object({
      todo: TodoSchema,
    });

    const todoParsed = todoSchema.safeParse(todoFromServer);

    if (!todoParsed.success) {
      throw new Error("Fail to create TODO");
    }

    const createdTodo = todoParsed.data.todo;

    return {
      id: createdTodo.id,
      content: createdTodo.content,
      date: createdTodo.date,
      done: createdTodo.done,
    };
  });
}

async function toggleDone(id: string): Promise<Todo> {
  return fetch(`/api/todos/${id}/toggle-done`, {
    method: "PUT",
  }).then(async (serverResponse) => {
    const responseString = await serverResponse.text();
    const responseParsed = JSON.parse(responseString);

    if (!serverResponse.ok) {
      throw new Error(responseParsed.message);
    }

    const todoSchema = schema.object({
      todo: TodoSchema,
    });

    const todoParsed = todoSchema.safeParse(responseParsed);

    if (!todoParsed.success) {
      throw new Error("Fail to toggle done");
    }

    const toggledTodo = todoParsed.data.todo;

    return {
      id: toggledTodo.id,
      content: toggledTodo.content,
      date: toggledTodo.date,
      done: toggledTodo.done,
    };
  });
}

async function deleteById(id: string): Promise<void> {
  return fetch(`/api/todos/${id}`, {
    method: "DELETE",
  }).then(async (serverResponse) => {
    if (!serverResponse.ok) {
      const responseString = await serverResponse.text();
      const responseParsed = JSON.parse(responseString);
      throw new Error(responseParsed.message);
    }
  });
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};

function parseTodosFromServer(responseBody: unknown): {
  total: number;
  pages: number;
  todos: Todo[];
} {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    "total" in responseBody &&
    "pages" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo == null || typeof todo !== "object") {
          throw new Error("Invalid todo object from API");
        }
        const { id, content, date, done } = todo as {
          id: string;
          content: string;
          date: string;
          done: string;
        };
        return {
          id,
          content,
          date: date,
          done: String(done).toLowerCase() === "true",
        };
      }),
    };
  }
  return {
    total: 0,
    pages: 0,
    todos: [],
  };
}
