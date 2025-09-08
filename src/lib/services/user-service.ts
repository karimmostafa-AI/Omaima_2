import { prisma } from '@/lib/db';
import { User, UserRole, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

export interface UserCreateData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  gender?: Gender;
  dateOfBirth?: Date;
}

export interface UserUpdateData extends Partial<Omit<UserCreateData, 'password' | 'email'>> {}

export interface UserFilters {
  role?: UserRole;
  page?: number;
  limit?: number;
  search?: string;
}

export class UserService {
  /**
   * Get a paginated list of users.
   */
  static async getUsers(filters: UserFilters = {}) {
    const { role = UserRole.CUSTOMER, page = 1, limit = 10, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = { role };
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(({ passwordHash, ...user }) => user), // Exclude password hash
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID.
   */
  static async getUser(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Create a new user.
   */
  static async createUser(data: UserCreateData): Promise<Omit<User, 'passwordHash'>> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  /**
   * Update an existing user.
   */
  static async updateUser(id: string, data: UserUpdateData): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Delete a user.
   */
  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Reset a user's password.
   */
  static async resetPassword(id: string, newPassword: string): Promise<void> {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      await prisma.user.update({
          where: { id },
          data: { passwordHash },
      });
  }
}
