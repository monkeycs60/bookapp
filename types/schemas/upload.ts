import * as z from 'zod';

export const uploadFormSchema = z.object({
	summaryType: z.enum(['flash', 'detailed', 'extra'], {
		required_error: 'Veuillez sélectionner un type de résumé',
	}),
	file: z.any().optional(),
});

export type UploadFormValues = z.infer<typeof uploadFormSchema>;
