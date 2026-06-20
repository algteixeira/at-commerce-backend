const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserController {
    sysUsers = [];
    create = async (req,res) => {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "AUTH", message: "Missing username/password!"});
        }
        await prisma.user.create({
            data: {
                username,
                password
            }
        });
        return res.status(200).json({message:'Created!'});
    }

    login = async (req, res) => {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "AUTH", message: "Missing username/password!"});
        }
        const authenticated = await prisma.user.findFirst({
            where: {
                username,
                password
            }
        })
        if (!authenticated) {
            return res.status(400).json({
                error: "AUTH",
                message: "Wrong credentials!"
            });
        }
        return res.status(200).json({message:"Access granted!"});
    }
}

module.exports = {UserController};