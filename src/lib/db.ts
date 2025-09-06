import { PrismaClient } from '@prisma/client'

// Prisma client singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection utilities
export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
    throw error
  }
}

// Database health check
export const checkDBHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    console.error('Database health check failed:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { status: 'unhealthy', error: errorMessage, timestamp: new Date().toISOString() }
  }
}

// Transaction wrapper
export const withTransaction = async <T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback)
}

export default prisma