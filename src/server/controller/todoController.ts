import { todoRepository } from "@server/repository/todoRepository";
import { NextRequest } from "next/server";
import { z as schema } from "zod";
import { NotFoundError } from "../infra/errors";

async function get(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  if (page !== null && isNaN(Number(page))) {
    return new Response("Invalid page number", { status: 400 });
  }

  if (limit !== null && isNaN(Number(limit))) {
    return new Response("Invalid limit number", { status: 400 });
  }

  const output = await todoRepository.get({
    page: page !== null ? Number(page) : undefined,
    limit: limit !== null ? Number(limit) : undefined,
  });
  return new Response(
    JSON.stringify({
      total: output.total,
      pages: output.pages,
      todos: output.todos,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});

async function create(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: "Missing request body" }), {
      status: 400,
    });
  }

  const body = TodoCreateBodySchema.safeParse(json);

  if (!body.success) {
    return new Response(
      JSON.stringify({
        message: "Invalid request body",
        descriptions: body.error.issues,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content);
    const todo = {
      todo: createdTodo,
    };
    return new Response(JSON.stringify(todo), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function toggleDone(req: NextRequest, id: string) {
  if (!id || typeof id !== "string") {
    return new Response(JSON.stringify({ message: "ID must be a string" }), {
      status: 400,
    });
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(id);
    return new Response(JSON.stringify({ todo: updatedTodo }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

async function deleteById(req: NextRequest, id: string) {
  const QuerySchema = schema.object({
    id: schema.string().uuid().min(1),
  });

  const parsedId = QuerySchema.safeParse({ id });

  if (!parsedId.success) {
    return new Response(
      JSON.stringify({
        message: "Invalid request body",
        descriptions: parsedId.error.issues,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await todoRepository.deleteById(parsedId.data.id);
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    new Response(JSON.stringify({ message: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
