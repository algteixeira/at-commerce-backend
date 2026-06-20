const { UserController } = require('../controllers/user.controller');

const { PrismaClient } = require('@prisma/client');
jest.mock('@prisma/client', () => {
    const mPrisma = {
        user: {
            create: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

describe('UserController', () => {
    let userController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        userController = new UserController();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Method: create', () => {
        test('Must create a new user properly when receiving valid data', async () => {
            mockReq = {
                body: { username: 'luiz', password: '123' }
            };

            prisma.user.create.mockResolvedValue({ id: 1, username: 'luiz' });

            await userController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Created!' })
            );
        });

        test('Must return error if missing user/pass', async () => {
            mockReq = { body: { username: '', password: '123' } };

            await userController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: "AUTH",
                message: "Missing username/password!"
            });
        });
    });

    describe('Method: login', () => {
    test('Must give login permission if existing data was provided!', async () => {
        mockReq = { body: { username: 'luiz', password: '123' } };

        prisma.user.findFirst.mockResolvedValue({ username: 'luiz', password: '123' });

        await userController.login(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Access granted!" });
    });

    test('Must block access when no user or password was provided', async () => {
        mockReq = { body: { username: '', password: '123' } };

        prisma.user.findFirst.mockResolvedValue({ username: '', password: '123' });

        await userController.login(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "AUTH",
            message: "Missing username/password!"
        });
    });

    test('Must block access when wrong user/pass was provided', async () => {
        prisma.user.findFirst.mockResolvedValue(null);
        
        mockReq = { body: { username: 'xisculous', password: 'danone' } };
        
        await userController.login(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "AUTH",
            message: "Wrong credentials!"
        });
    });
});
});