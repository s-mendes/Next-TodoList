import { todoController } from "@server/controller/todoController";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const output = await todoController.get(req);
  return output;
}

export async function POST(req: NextRequest) {
  const output = await todoController.create(req);
  return output;
}
