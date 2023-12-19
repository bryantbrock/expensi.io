import { type MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [{ title: 'Expensi.io' }]

export default function Index() {
	return (
		<main className="relative sm:flex sm:items-center sm:justify-center"></main>
	)
}
