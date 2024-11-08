import { NextRequest, NextResponse } from 'next/server';
import { uploadFormSchema } from '@/types/schemas/upload';
import pdfParse from 'pdf-parse';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Vérification que les variables d'environnement nécessaires sont présentes
if (!process.env.ANTHROPIC_API_KEY) {
	throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
}

// Fonction pour découper le texte en morceaux de taille appropriée
function splitTextIntoChunks(
	text: string,
	maxChunkSize: number = 8000
): string[] {
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
	const chunkPrompt =
		'Fais un résumé clair et concis de cette partie du texte en gardant les informations essentielles.';

	let finalPrompt;
	switch (summaryType) {
		case 'flash':
			finalPrompt =
				"Synthétise ces différents résumés en un résumé final d'une page maximum, en te concentrant sur les points essentiels uniquement.";
			break;
		case 'detailed':
			finalPrompt =
				'Synthétise ces différents résumés en un résumé final de 5 pages maximum, en incluant les points principaux et les détails importants.';
			break;
		case 'extra':
			finalPrompt =
				'Synthétise ces différents résumés en un résumé final de 15 pages maximum, en incluant tous les points importants, les détails et les nuances.';
			break;
		default:
			finalPrompt = 'Synthétise ces différents résumés de manière concise.';
	}

	return { chunkPrompt, finalPrompt };
}

export async function POST(request: Request) {
	console.log('🚀 Route API /api/analyze appelée');

	console.log('Request:', request);

	const body = await request.json();
	console.log('Body:', body);

	const validatedData = uploadFormSchema.parse(body);
	console.log('Data validated successfully', {
		summaryType: validatedData.summaryType,
		fileName: validatedData.file.name,
		fileSize: validatedData.file.size,
	});

	return NextResponse.json({ message: 'Hello, world!', body });

	// try {
	// 	// Parse directement le JSON sans vérifier le Content-Type
	// 	const body = await request.json();
	// 	console.log('Body parsed successfully');

	// 	// Validation des données
	// 	const validatedData = uploadFormSchema.parse(body);
	// 	console.log('Data validated successfully', {
	// 		summaryType: validatedData.summaryType,
	// 		fileName: validatedData.file.name,
	// 		fileSize: validatedData.file.size,
	// 	});

	// 	// Vérification du base64
	// 	if (!validatedData.file.base64) {
	// 		return NextResponse.json(
	// 			{ error: 'No base64 data provided' },
	// 			{ status: 400 }
	// 		);
	// 	}

	// 	// Décodage et parsing du PDF
	// 	const fileBuffer = Buffer.from(validatedData.file.base64, 'base64');
	// 	console.log('File buffer created, size:', fileBuffer.length);

	// 	const pdfData = await pdfParse(fileBuffer);
	// 	console.log('PDF parsed successfully', {
	// 		pages: pdfData.numpages,
	// 		textLength: pdfData.text.length,
	// 	});

	// 	const textChunks = splitTextIntoChunks(pdfData.text);
	// 	console.log('Text split into chunks:', textChunks.length);

	// 	const model = anthropic('claude-3-haiku-20240307');
	// 	const { chunkPrompt, finalPrompt } = getPrompts(
	// 		validatedData.summaryType
	// 	);

	// 	// Première étape : résumé de chaque partie
	// 	console.log('Starting chunk analysis...');
	// 	const chunkSummaries = await Promise.all(
	// 		textChunks.map(async (chunk, index) => {
	// 			console.log(`Processing chunk ${index + 1}/${textChunks.length}`);
	// 			const { text } = await generateText({
	// 				model,
	// 				messages: [
	// 					{
	// 						role: 'user',
	// 						content: `${chunkPrompt}\n\nTexte à résumer:\n${chunk}`,
	// 					},
	// 				],
	// 			});
	// 			console.log(`Chunk ${index + 1} processed successfully`);
	// 			return text;
	// 		})
	// 	);

	// 	// Deuxième étape : synthèse finale
	// 	console.log('Starting final synthesis...');
	// 	const { text: finalSummary } = await generateText({
	// 		model,
	// 		messages: [
	// 			{
	// 				role: 'user',
	// 				content: `${finalPrompt}\n\nRésumés à synthétiser:\n${chunkSummaries.join(
	// 					'\n\n---\n\n'
	// 				)}`,
	// 			},
	// 		],
	// 	});
	// 	console.log('Final synthesis completed');

	// 	return NextResponse.json({
	// 		success: true,
	// 		message: 'Document analysé avec succès',
	// 		data: finalSummary,
	// 	});
	// } catch (error: any) {
	// 	console.error('❌ Erreur détaillée:', {
	// 		name: error.name,
	// 		message: error.message,
	// 		stack: error.stack,
	// 	});

	// 	// Gestion spécifique des erreurs
	// 	if (error.name === 'SyntaxError') {
	// 		return NextResponse.json(
	// 			{
	// 				success: false,
	// 				message: 'Erreur de parsing JSON',
	// 				details: error.message,
	// 			},
	// 			{ status: 400 }
	// 		);
	// 	}

	// 	if (error.name === 'ZodError') {
	// 		return NextResponse.json(
	// 			{
	// 				success: false,
	// 				message: 'Données invalides',
	// 				details: error.errors,
	// 			},
	// 			{ status: 400 }
	// 		);
	// 	}

	// 	return NextResponse.json(
	// 		{
	// 			success: false,
	// 			message: "Erreur lors de l'analyse du document",
	// 			details: error.message,
	// 		},
	// 		{ status: 500 }
	// 	);
	// }
}
