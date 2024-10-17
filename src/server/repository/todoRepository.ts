import { Todo, TodoSchema } from "@src/server/schemas/todo";
import { supabase } from "../infra/db/supabase";

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface todoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

async function get(
  { page = 1, limit = 10 }: TodoRepositoryGetParams = {
    page: 1,
    limit: 10,
  }
): Promise<todoRepositoryGetOutput> {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit - 1;

  const { data, error, count } = await supabase
    .from("todos")
    .select("*", {
      count: "exact",
    })
    .order("date", { ascending: false })
    .range(startIndex, endIndex);

  if (error) {
    throw new Error(error.message);
  }

  const parsedData = TodoSchema.array().safeParse(data);

  if (!parsedData.success) {
    throw new Error("Failed to parse TODO from database ");
  }

  const todos = parsedData.data;
  const total = count || todos.length;
  const pages = Math.ceil(total / limit);

  return {
    todos,
    total,
    pages,
  };
}

async function getTodoById(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .match({ id })
    .single();

  if (error) {
    throw new Error("Failed to get TODO by id");
  }

  const parsedData = TodoSchema.parse(data);

  return parsedData;
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        content,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const parsedData = TodoSchema.parse(data);

  return parsedData;

  // const newTodo = create(content);
  // return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
  const todo = await getTodoById(id);
  const { data, error } = await supabase
    .from("todos")
    .update({ done: !todo.done })
    .match({ id })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update TODO");
  }

  const parsedData = TodoSchema.parse(data);

  return parsedData;
}

async function deleteById(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().match({ id });

  if (error) {
    throw new Error(`Fail to delete recourd with id ${id}`);
  }
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};
