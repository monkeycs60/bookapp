import { PDFDocument, StandardFonts } from 'pdf-lib';
import PDFParser from 'pdf-parse';

interface PDFMetadata {
	pages: number;
	title: string;
	author: string;
}

export async function parsePDF(file: Buffer) {
	try {
		// Utiliser pdf-parse pour extraire le texte et les métadonnées
		const pdfData = await PDFParser(file, {
			max: 0, // Pas de limite de pages
		});
		console.log('pdfData', pdfData);

		// Découpage en sections de ~1000 mots
		const words = pdfData.text.split(/\s+/).filter(Boolean);
		const sections = [];
		let currentSection = [];

		for (const word of words) {
			currentSection.push(word);
			if (currentSection.length >= 1000) {
				sections.push(currentSection.join(' '));
				currentSection = [];
			}
		}

		if (currentSection.length > 0) {
			sections.push(currentSection.join(' '));
		}

		// Extraire les métadonnées
		const metadata: PDFMetadata = {
			pages: pdfData.numpages,
			title: pdfData.info?.Title || 'Document sans titre',
			author: pdfData.info?.Author || 'Auteur inconnu',
		};

		return { sections, metadata };
	} catch (error) {
		console.error('Erreur lors du parsing du PDF:', error);
		throw new Error('Impossible de lire le fichier PDF');
	}
}

export async function createSummaryPDF(
	summary: string,
	metadata: PDFMetadata
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create();
	const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

	// Fonction pour ajouter une page avec du texte
	const addPage = (text: string) => {
		const page = pdfDoc.addPage();
		page.setFont(timesRomanFont);

		const lines = text.split('\n');
		let yPosition = page.getHeight() - 50;

		for (const line of lines) {
			if (yPosition < 50) {
				return line; // Retourne le texte restant
			}

			page.drawText(line, {
				x: 50,
				y: yPosition,
				size: 12,
				maxWidth: page.getWidth() - 100,
			});

			yPosition -= 15;
		}

		return ''; // Tout le texte a été écrit
	};

	// Première page avec en-tête
	const firstPage = pdfDoc.addPage();
	firstPage.setFont(timesRomanFont);

	// En-tête
	firstPage.drawText('Résumé par Book Leizure', {
		x: 50,
		y: firstPage.getHeight() - 50,
		size: 20,
	});

	firstPage.drawText(`Titre original : ${metadata.title}`, {
		x: 50,
		y: firstPage.getHeight() - 100,
		size: 14,
	});

	firstPage.drawText(`Auteur : ${metadata.author}`, {
		x: 50,
		y: firstPage.getHeight() - 120,
		size: 12,
	});

	// Contenu
	let remainingText = summary;
	let yPosition = firstPage.getHeight() - 160;

	// Écrire le contenu sur la première page
	const lines = remainingText.split('\n');
	for (const line of lines) {
		if (yPosition < 50) {
			remainingText = lines.slice(lines.indexOf(line)).join('\n');
			break;
		}

		firstPage.drawText(line, {
			x: 50,
			y: yPosition,
			size: 12,
			maxWidth: firstPage.getWidth() - 100,
		});

		yPosition -= 15;
	}

	// Ajouter des pages supplémentaires si nécessaire
	while (remainingText) {
		remainingText = addPage(remainingText);
	}

	return pdfDoc.save();
}
