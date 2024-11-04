import * as z from 'zod';

export const uploadFormSchema = z.object({
	file: z.any().optional(),
	summaryType: z.enum(['flash', 'detailed', 'extra'], {
		required_error: 'Veuillez sélectionner un type de résumé',
	}),
});

export type UploadFormValues = z.infer<typeof uploadFormSchema>;
