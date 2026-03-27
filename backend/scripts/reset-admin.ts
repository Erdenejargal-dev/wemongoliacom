/**
 * One-time script to reset the admin user password.
 * Run: cd backend && npx tsx scripts/reset-admin.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'info@wemongolia.com'
  const password = 'admin123'

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role:         'admin',
      isVerified:   true,
    },
    create: {
      firstName:    'WeMongolia',
      lastName:     'Admin',
      email,
      passwordHash: hash,
      role:         'admin',
      isVerified:   true,
    },
  })

  console.log(`✅  Admin user ready:`)
  console.log(`    email:    ${user.email}`)
  console.log(`    role:     ${user.role}`)
  console.log(`    password: ${password}`)
}

main()
  .catch(err => {
    console.error('Failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
