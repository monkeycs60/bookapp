declare module 'pdf-parse' {
	interface PDFData {
		numpages: number;
		text: string;
		info?: {
			Title?: string;
			Author?: string;
		};
	}

	function PDFParser(
		dataBuffer: Buffer,
		options?: { max?: number }
	): Promise<PDFData>;
	export default PDFParser;
}
