import { type MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [{ title: 'Expensi.io' }]

export default function Index() {
	return (
		<main className="relative min-h-screen sm:flex sm:items-center sm:justify-center"></main>
	)
}
