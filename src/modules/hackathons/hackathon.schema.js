import { z } from 'zod';

export const createHackathonSchema = z.object({
  title: z.string().min(3),
  theme: z.string().min(3),
  startDate: z.string().datetime(), // ISO 8601
  endDate: z.string().datetime(),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export const updateHackathonSchema = z.object({
  title: z.string().min(3).optional(),
  theme: z.string().min(3).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'FINISHED']).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export const assignJudgeSchema = z.object({
  userId: z.string().uuid(),
});