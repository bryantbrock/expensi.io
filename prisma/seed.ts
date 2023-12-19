import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import {
	cleanupDb,
	createPassword,
	createUser,
	getExpenseImages,
} from '#tests/db-utils.ts'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	await cleanupDb(prisma)
	console.timeEnd('🧹 Cleaned up the database...')

	console.time('🔑 Created permissions...')
	const entities = ['user', 'note']
	const actions = ['create', 'read', 'update', 'delete']
	const accesses = ['own', 'any'] as const
	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await prisma.permission.create({ data: { entity, action, access } })
			}
		}
	}
	console.timeEnd('🔑 Created permissions...')

	console.time('👑 Created roles...')
	await prisma.role.create({
		data: {
			name: 'admin',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'any' },
				}),
			},
		},
	})
	await prisma.role.create({
		data: {
			name: 'user',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'own' },
				}),
			},
		},
	})
	console.timeEnd('👑 Created roles...')

	const totalUsers = 5
	console.time(`👤 Created ${totalUsers} users...`)
	const expenseImages = await getExpenseImages()

	for (let index = 0; index < totalUsers; index++) {
		const userData = createUser()
		await prisma.user
			.create({
				select: { id: true },
				data: {
					...userData,
					password: { create: createPassword(userData.email) },
					roles: { connect: { name: 'user' } },
					expenses: {
						create: {
							amount: parseFloat(faker.commerce.price()),
							description: faker.lorem.sentence(),
							date: faker.date.past(),
							receipt: {
								create: expenseImages[faker.number.int({ min: 0, max: 9 })],
							},
						},
					},
				},
			})
			.catch(e => {
				console.error('Error creating a user:', e)
				return null
			})
	}
	console.timeEnd(`👤 Created ${totalUsers} users...`)

	console.time(`🔒 Created admin users`)

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'bryant@brock.software',
			name: 'Bryant',
			password: {
				create: createPassword(
					'd8uNRHcXiFdU7hh9YVKvKL8fxPzgo3Rf62gNCGwT978JuY2hz4',
				),
			},
			roles: { connect: [{ name: 'admin' }, { name: 'user' }] },
		},
	})
	console.timeEnd(`🔒 Created admin users`)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
