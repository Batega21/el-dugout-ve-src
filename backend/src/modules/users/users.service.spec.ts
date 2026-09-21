import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { UserNotFoundException, EmailAlreadyExistsException } from '../../common/errors';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' },
      ]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('test@example.com');
    });
  });

  describe('findOne', () => {
    it('should throw UserNotFoundException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(UserNotFoundException);
    });

    it('should return user if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });
      const user = await service.findOne('1');
      expect(user.id).toBe('1');
    });
  });

  describe('create', () => {
    it('should throw EmailAlreadyExistsException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });
      await expect(
        service.create({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(EmailAlreadyExistsException);
    });
  });
});
