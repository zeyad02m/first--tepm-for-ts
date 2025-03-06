import express from 'express';
import { deleteUserById, getUserById, getUsers } from '../db/Users';

export const getAllUsers = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const users = await getUsers(); // جلب جميع المستخدمين من قاعدة البيانات
        res.status(200).json(users); // إرسال الاستجابة مع المستخدمين
    } catch (error) {
        console.error(error); // طباعة الخطأ في الكونسول
        res.sendStatus(400); // إرسال استجابة خطأ
    }
};

export const deleteUser = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUserById(id);
        res.json(deletedUser);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
};

export const updateUser = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!username) {
            res.sendStatus(400);
            return; // ⬅️ إضافة `return` لمنع تنفيذ الكود بعد إرسال الاستجابة
        }

        const user = await getUserById(id);
        if (!user) {
            res.sendStatus(404);
            return; // ⬅️ إضافة `return` بعد `res.sendStatus(404)`
        }

        user.username = username;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
};
