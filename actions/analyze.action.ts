'use server';

import { actionClient } from '@/lib/safe-action';
import { uploadFormSchema } from '@/types/schemas/upload';
import { parsePDF, createSummaryPDF } from '@/services/pdf';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const analyzeDocument = actionClient
	.schema(uploadFormSchema)
	.action(async ({ parsedInput: { file, summaryType } }) => {
		try {
			// Conversion du fichier en buffer
			const buffer = Buffer.from(await file.arrayBuffer());

			// Analyse du PDF
			const { sections, metadata } = await parsePDF(buffer);

			// Définir la longueur du résumé selon le type
			const summaryLengths = {
				flash: 'environ 1 page (500 mots)',
				detailed: 'environ 5 pages (2500 mots)',
				extra: 'environ 15 pages (7500 mots)',
			};

			const result = await streamText({
				model: anthropic('claude-3-haiku-20240307'),
				messages: [
					{
						role: 'system',
						content: 'Tu es un expert en analyse et synthèse de livres.',
					},
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: `Analyse ce texte et crée un résumé structuré en ${
									summaryLengths[
										summaryType as keyof typeof summaryLengths
									]
								}. 
                Le résumé doit inclure :
                - Les points clés
                - Les idées principales
                - Les conclusions importantes
                
                Texte à analyser : ${sections.join('\n\n')}`,
							},
						],
					},
				],
			});

			let summary = '';
			for await (const chunk of result.textStream) {
				summary += chunk;
			}

			// Création du PDF
			const pdfBytes = await createSummaryPDF(summary, metadata);

			return {
				success: true,
				summary,
				pdf: Buffer.from(pdfBytes).toString('base64'),
			};
		} catch (error) {
			console.error('Error:', error);
			throw new Error("Une erreur est survenue lors de l'analyse");
		}
	});
