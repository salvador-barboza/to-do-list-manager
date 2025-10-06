import { z } from 'zod';
import { collection } from '@github/spark/db';

export const todo = z.object({
  text: z.string().min(1),
  completed: z.boolean().default(false),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
});

export type Todo = z.infer<typeof todo>;

export const todoCollection = collection(todo, 'todos');