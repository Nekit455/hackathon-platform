import { z } from 'zod';

export const createGradeSchema = z.object({
  criterionId: z.string().uuid(),
  score: z.number().int().min(0),
});
