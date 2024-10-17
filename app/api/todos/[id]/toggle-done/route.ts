import { todoController } from "@src/server/controller/todoController";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const output = await todoController.toggleDone(req, id);
  return output;
}
