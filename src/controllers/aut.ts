import { Request, Response } from 'express';
import { createUser, getUserByEmail } from '../db/Users';
import { authentication, random } from '../helpers';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // تحقق من وجود الحقول المطلوبة
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // جلب المستخدم من قاعدة البيانات مع الحقول المطلوبة
        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        // التحقق من وجود authentication و salt
        if (!user.authentication?.salt) {
            res.status(400).json({ message: 'Authentication data is missing or invalid' });
            return;
        }

        // التحقق من كلمة المرور
        const expectedHash = authentication(user.authentication.salt, password);

        if (user.authentication.password !== expectedHash) {
            res.status(403).json({ message: 'Invalid password' });
            return;
        }

        // إنشاء sessionToken وحفظه في المستخدم
        const salt = random();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        // إعداد الكوكي
        res.cookie('VORTEX-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

        // إرجاع المستخدم
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'An error occurred' });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, username } = req.body;

        // تحقق من وجود الحقول المطلوبة
        if (!email || !password || !username) {
            res.status(400).json({ message: 'Email, password, and username are required' });
            return;
        }

        // تحقق من وجود المستخدم مسبقًا
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // إنشاء salt وكلمة مرور مشفرة
        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password),
            },
        });

        // إرجاع المستخدم المُنشأ
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'An error occurred' });
    }
};