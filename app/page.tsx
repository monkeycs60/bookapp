import { auth } from '@/auth';
import Navbar from '@/components/Navbar';

export default async function Home() {
	const session = await auth();

	return (
		<div className='min-h-screen bg-background'>
			<Navbar session={session} />

			<main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
				{/* Hero Section */}
				<div className='text-center py-20'>
					<h1 className='text-4xl sm:text-6xl font-bold tracking-tight'>
						Transformez vos livres en{' '}
						<span className='text-blue-600'>résumés intelligents</span>
					</h1>
					<p className='mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto'>
						Book Leizure utilise l'IA pour analyser et résumer vos PDF et
						EPUB, vous permettant de capturer l'essentiel de vos lectures
						en quelques minutes.
					</p>
					<div className='mt-10'>
						<a
							href='/upload'
							className='rounded-full bg-blue-600 px-8 py-4 text-white font-medium hover:bg-blue-700 transition-colors'>
							Commencer gratuitement
						</a>
					</div>
				</div>

				{/* Features Section */}
				<div className='grid md:grid-cols-3 gap-8 py-20'>
					<div className='text-center'>
						<div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-6 h-6 text-blue-600'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 10V3L4 14h7v7l9-11h-7z'
								/>
							</svg>
						</div>
						<h3 className='text-xl font-semibold mb-2'>
							Rapide et Efficace
						</h3>
						<p className='text-gray-600'>
							Obtenez des résumés pertinents en quelques secondes
						</p>
					</div>
					<div className='text-center'>
						<div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-6 h-6 text-blue-600'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</div>
						<h3 className='text-xl font-semibold mb-2'>
							Précis et Fiable
						</h3>
						<p className='text-gray-600'>
							IA entraînée pour extraire les informations essentielles
						</p>
					</div>
					<div className='text-center'>
						<div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-6 h-6 text-blue-600'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 6v6m0 0v6m0-6h6m-6 0H6'
								/>
							</svg>
						</div>
						<h3 className='text-xl font-semibold mb-2'>Multi-formats</h3>
						<p className='text-gray-600'>Compatible avec PDF et EPUB</p>
					</div>
				</div>
			</main>
		</div>
	);
}
