import { z as schema } from "zod";

export const TodoSchema = schema.object({
  id: schema.string().uuid(),
  content: schema.string().min(1),
  date: schema.string().transform((date) => {
    return new Date(date).toISOString();
  }),
  done: schema.string().transform((done) => {
    return done === "true";
  }),
});

export type Todo = schema.infer<typeof TodoSchema>;
