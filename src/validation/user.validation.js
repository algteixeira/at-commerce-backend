const { z } = require('zod');

const userSchema = z.object({
        username: z.string().min(5, 'username cant have less than 5 characters'),
        password: z.string().min(5, 'password shouldnt have less than 5 characters')
        .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'password must contain at least one special character'),
    });

const userValidation = (req, res, next) => {
    const validation = userSchema.safeParse(req.body);
    if (!validation?.success) {
        return res.status(400).json({
            errors: validation?.error?.errors
        });
    }

    req.body = validation?.data;

    next ();
}

module.exports = { userValidation };