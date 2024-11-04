import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UploadForm } from './_components/UploadForm';
import Navbar from '@/components/Navbar';

export default async function UploadPage() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	return (
		<div className='min-h-screen bg-background'>
			<Navbar session={session} />

			<main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
				<div className='py-20'>
					<h1 className='text-3xl font-bold text-center mb-2'>
						Uploadez votre document
					</h1>
					<p className='text-gray-600 text-center mb-8'>
						Notre IA analysera votre document et en extraira les points
						essentiels
					</p>
					<div className='flex justify-center'>
						<UploadForm />
					</div>
				</div>
			</main>
		</div>
	);
}
