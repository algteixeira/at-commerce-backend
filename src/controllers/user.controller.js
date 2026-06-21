const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

class UserController {
    create = async (req,res) => {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "AUTH", message: "Missing username/password!"});
        }
        const dbPass = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username,
                password: dbPass
            }
        });
        return res.status(200).json({message:'Created!'});
    }

    login = async (req, res) => {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "AUTH", message: "Missing username/password!"});
        }
        
        const authenticated = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if (!authenticated || !await bcrypt.compare(password, authenticated.password)) {
            return res.status(400).json({
                error: "AUTH",
                message: "Wrong credentials!"
            });
        }
        return res.status(200).json({message:"Access granted!"});
    }
}

module.exports = {UserController};