'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DevTool } from '@hookform/devtools';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { uploadFormSchema, UploadFormValues } from '@/types/schemas/upload';

export function UploadForm() {
	const [progress, setProgress] = useState(0);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	const form = useForm<UploadFormValues>({
		resolver: zodResolver(uploadFormSchema),
		defaultValues: {
			summaryType: 'flash',
		},
	});

	const validateFile = (file: File | null): string | null => {
		if (!file) return 'Le fichier est requis';
		if (file.type !== 'application/pdf') {
			return 'Seuls les fichiers PDF sont acceptés pour le moment.';
		}
		if (file.size > 10000000) {
			return 'La taille maximum est de 10MB.';
		}
		return null;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setSelectedFile(file);
		form.setValue('file', file);
		setFileError(validateFile(file));
	};

	const onSubmit = async (values: UploadFormValues) => {
		console.log('values', values);
		if (!selectedFile) {
			setFileError('Le fichier est requis');
			return;
		}

		const fileError = validateFile(selectedFile);
		if (fileError) {
			setFileError(fileError);
			return;
		}

		try {
			console.log('début du try avant lexec serv action');
			setIsAnalyzing(true);
			setProgress(0);

			const arrayBuffer = await selectedFile.arrayBuffer();
			const base64 = Buffer.from(arrayBuffer).toString('base64');

			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					summaryType: values.summaryType,
					file: {
						name: selectedFile.name,
						type: selectedFile.type,
						size: selectedFile.size,
						base64: base64,
					},
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Une erreur est survenue');
			}

			console.log('Résumé:', result.data);
			setProgress(100);

		} catch (error) {
			console.error('Error:', error);
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<FormField
					control={form.control}
					name='file'
					render={() => (
						<FormItem>
							<FormControl>
								<div className='grid w-full max-w-lg gap-4'>
									<div className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-blue-600 transition-colors'>
										<svg
											className='mx-auto h-12 w-12 text-gray-400'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
											/>
										</svg>
										<div className='mt-4 flex text-sm text-gray-600'>
											<label className='relative cursor-pointer rounded-md font-medium text-blue-600 focus-within:outline-none'>
												<span>Uploadez un fichier</span>
												<Input
													type='file'
													className='sr-only'
													accept='.pdf,.epub'
													onChange={handleFileChange}
												/>
											</label>
											<p className='pl-1'>ou glissez-déposez</p>
										</div>
										<p className='text-xs text-gray-500'>
											PDF ou EPUB jusqu'à 10MB
										</p>
										{selectedFile && (
											<p className='mt-2 text-sm text-gray-600'>
												Fichier sélectionné: {selectedFile.name}
											</p>
										)}
										{fileError && (
											<p className='mt-2 text-sm text-red-500'>
												{fileError}
											</p>
										)}
									</div>
									{progress > 0 && (
										<div className='w-full space-y-2'>
											<Progress
												value={progress}
												className='w-full'
											/>
											<p className='text-sm text-gray-600 text-center'>
												{progress}%{' '}
												{progress === 100
													? 'Terminé'
													: "En cours d'analyse"}
											</p>
										</div>
									)}
									<Button type='submit' disabled={isAnalyzing}>
										{isAnalyzing
											? 'Analyse en cours...'
											: 'Analyser le document'}
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='summaryType'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type de résumé</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className='grid grid-cols-3 gap-4'>
									<FormItem className='flex gap-1 items-center'>
										<FormControl>
											<RadioGroupItem value='flash' id='flash' />
										</FormControl>
										<FormLabel htmlFor='flash'>
											Résumé éclair (1 page)
										</FormLabel>
									</FormItem>
									<FormItem className='flex gap-1 items-center'>
										<FormControl>
											<RadioGroupItem
												value='detailed'
												id='detailed'
											/>
										</FormControl>
										<FormLabel htmlFor='detailed'>
											Résumé détaillé (5 pages)
										</FormLabel>
									</FormItem>
									<FormItem className='flex gap-1 items-center'>
										<FormControl>
											<RadioGroupItem value='extra' id='extra' />
										</FormControl>
										<FormLabel htmlFor='extra'>
											Résumé extra (15 pages)
										</FormLabel>
									</FormItem>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
			<DevTool control={form.control} />
		</Form>
	);
}
