"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.getAllUsers = void 0;
const Users_1 = require("../db/Users");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, Users_1.getUsers)(); // جلب جميع المستخدمين من قاعدة البيانات
        res.status(200).json(users); // إرسال الاستجابة مع المستخدمين
    }
    catch (error) {
        console.error(error); // طباعة الخطأ في الكونسول
        res.sendStatus(400); // إرسال استجابة خطأ
    }
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedUser = yield (0, Users_1.deleteUserById)(id);
        res.json(deletedUser);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
});
exports.deleteUser = deleteUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username } = req.body;
        if (!username) {
            res.sendStatus(400);
            return; // ⬅️ إضافة `return` لمنع تنفيذ الكود بعد إرسال الاستجابة
        }
        const user = yield (0, Users_1.getUserById)(id);
        if (!user) {
            res.sendStatus(404);
            return; // ⬅️ إضافة `return` بعد `res.sendStatus(404)`
        }
        user.username = username;
        yield user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
});
exports.updateUser = updateUser;
