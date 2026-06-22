const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

class UserController {
    create = async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "AUTH", message: "Missing username/password!" });
        }
        const dbPass = await bcrypt.hash(password, 10);
        try {
            const userExists = await prisma.user.findUnique({
                where: {
                    username
                }
            });
            if (userExists) {
                return res.status(400).json({
                    message: 'This username is already registered. Try another one.'
                })
            }
            await prisma.user.create({
                data: {
                    username,
                    password: dbPass
                }
            });
            return res.status(200).json({ message: 'Created!' });
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE ERROR',
                message: 'We had a problem accessing the database. Try again later.'
            });
        }
    }

    login = async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "AUTH", message: "Missing username/password!" });
        }

        try {
            const userDb = await prisma.user.findUnique({
                where: {
                    username
                }
            })

            if (!userDb || !await bcrypt.compare(password, userDb.password)) {
                return res.status(400).json({
                    error: "AUTH",
                    message: "Wrong credentials!"
                });
            }
            return res.status(200).json({ message: "Access granted!" });
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE ERROR',
                message: 'We had problems while accessing the database. Try again later.'
            })
        }
    }
}

module.exports = { UserController };