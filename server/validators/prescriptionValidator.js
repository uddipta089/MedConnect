import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  notes: z.string().optional(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  medicines: z.array(z.object({
    medicineName: z.string().min(1, 'Medicine name is required'),
    strength: z.string().optional(),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    beforeFood: z.boolean().optional(),
    afterFood: z.boolean().optional(),
    instructions: z.string().optional()
  })).min(1, 'At least one medicine is required')
});
