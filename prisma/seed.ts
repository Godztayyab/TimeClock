import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'
import { DEPARTMENTS, USERS, ASSIGNMENTS } from './seed-data'

const prisma = new PrismaClient()

async function main() {
  // Create departments
  const departments = await Promise.all(
    DEPARTMENTS.map(dept => 
      prisma.department.create({
        data: {
          name: dept.name,
          info: dept.info
        }
      })
    )
  )

  // Create users
  const users = await Promise.all(
    USERS.map(async user => {
      const hashedPassword = await hash(user.password, 12)
      return prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role
        }
      })
    })
  )

  // Create assignments
  await Promise.all(
    ASSIGNMENTS.map(assignment =>
      prisma.employeeDepartment.create({
        data: {
          userId: users[assignment.userIndex].id,
          departmentId: departments[assignment.departmentIndex].id,
          hourlyRate: DEPARTMENTS[assignment.departmentIndex].hourlyRate,
          role: assignment.role,
          position: assignment.position
        }
      })
    )
  )

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })