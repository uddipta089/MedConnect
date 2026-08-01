import { z } from 'zod';

export const symptomCheckerSchema = z.object({
  symptoms: z.string().min(5, 'Please provide more details about your symptoms')
});

export const reportSummarySchema = z.object({
  reportText: z.string().min(10, 'Report text is too short')
});

export const doctorRecommendationSchema = z.object({
  symptoms: z.string().min(5, 'Please provide more details'),
  city: z.string().optional(),
  consultationMode: z.enum(['In Person', 'Online', 'Both']).optional()
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty')
});
