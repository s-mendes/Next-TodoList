import { todoController } from "@src/server/controller/todoController";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const output = todoController.deleteById(req, id);
  return output;
}
