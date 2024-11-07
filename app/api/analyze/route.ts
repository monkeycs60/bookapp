import { NextRequest, NextResponse } from 'next/server';
import { uploadFormSchema } from '@/types/schemas/upload';
import pdfParse from 'pdf-parse';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Fonction pour découper le texte en morceaux de taille appropriée
function splitTextIntoChunks(text: string, maxChunkSize: number = 8000): string[] {
	const chunks: string[] = [];
	let currentChunk = '';
	
	const sentences = text.split('. ');
	
	for (const sentence of sentences) {
		if ((currentChunk + sentence).length < maxChunkSize) {
			currentChunk += sentence + '. ';
		} else {
			chunks.push(currentChunk);
			currentChunk = sentence + '. ';
		}
	}
	
	if (currentChunk) {
		chunks.push(currentChunk);
	}
	
	return chunks;
}

// Fonction pour obtenir les prompts en fonction du type de résumé
function getPrompts(summaryType: string) {
	const chunkPrompt = "Fais un résumé clair et concis de cette partie du texte en gardant les informations essentielles.";
	
	let finalPrompt;
	switch (summaryType) {
		case 'flash':
			finalPrompt = "Synthétise ces différents résumés en un résumé final d'une page maximum, en te concentrant sur les points essentiels uniquement.";
			break;
		case 'detailed':
			finalPrompt = "Synthétise ces différents résumés en un résumé final de 5 pages maximum, en incluant les points principaux et les détails importants.";
			break;
		case 'extra':
			finalPrompt = "Synthétise ces différents résumés en un résumé final de 15 pages maximum, en incluant tous les points importants, les détails et les nuances.";
			break;
		default:
			finalPrompt = "Synthétise ces différents résumés de manière concise.";
	}
	
	return { chunkPrompt, finalPrompt };
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = uploadFormSchema.parse(body);
		
		const fileBuffer = Buffer.from(validatedData.file.base64, 'base64');
		const pdfData = await pdfParse(fileBuffer);
		const textChunks = splitTextIntoChunks(pdfData.text);
		
		const model = anthropic('claude-3-haiku-20240307');
		const { chunkPrompt, finalPrompt } = getPrompts(validatedData.summaryType);
		
		// Première étape : résumé de chaque partie
		const chunkSummaries = await Promise.all(
			textChunks.map(async (chunk) => {
				const { text } = await generateText({
					model,
					messages: [
						{
							role: 'user',
							content: `${chunkPrompt}\n\nTexte à résumer:\n${chunk}`
						}
					]
				});
				return text;
			})
		);
		
		// Deuxième étape : synthèse finale
		const { text: finalSummary } = await generateText({
			model,
			messages: [
				{
					role: 'user',
					content: `${finalPrompt}\n\nRésumés à synthétiser:\n${chunkSummaries.join('\n\n---\n\n')}`
				}
			]
		});

		return NextResponse.json({
			success: true,
			message: 'Document analysé avec succès',
			data: finalSummary,
		});
		
	} catch (error) {
		console.error("Erreur lors de l'analyse:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'analyse du document",
			},
			{ status: 500 }
		);
	}
}
