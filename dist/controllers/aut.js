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
exports.register = exports.login = void 0;
const Users_1 = require("../db/Users");
const helpers_1 = require("../helpers");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, password } = req.body;
        // تحقق من وجود الحقول المطلوبة
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        // جلب المستخدم من قاعدة البيانات مع الحقول المطلوبة
        const user = yield (0, Users_1.getUserByEmail)(email).select('+authentication.salt +authentication.password');
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        // التحقق من وجود authentication و salt
        if (!((_a = user.authentication) === null || _a === void 0 ? void 0 : _a.salt)) {
            res.status(400).json({ message: 'Authentication data is missing or invalid' });
            return;
        }
        // التحقق من كلمة المرور
        const expectedHash = (0, helpers_1.authentication)(user.authentication.salt, password);
        if (user.authentication.password !== expectedHash) {
            res.status(403).json({ message: 'Invalid password' });
            return;
        }
        // إنشاء sessionToken وحفظه في المستخدم
        const salt = (0, helpers_1.random)();
        user.authentication.sessionToken = (0, helpers_1.authentication)(salt, user._id.toString());
        yield user.save();
        // إعداد الكوكي
        res.cookie('VORTEX-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });
        // إرجاع المستخدم
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: 'An error occurred' });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username } = req.body;
        // تحقق من وجود الحقول المطلوبة
        if (!email || !password || !username) {
            res.status(400).json({ message: 'Email, password, and username are required' });
            return;
        }
        // تحقق من وجود المستخدم مسبقًا
        const existingUser = yield (0, Users_1.getUserByEmail)(email);
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // إنشاء salt وكلمة مرور مشفرة
        const salt = (0, helpers_1.random)();
        const user = yield (0, Users_1.createUser)({
            email,
            username,
            authentication: {
                salt,
                password: (0, helpers_1.authentication)(salt, password),
            },
        });
        // إرجاع المستخدم المُنشأ
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: 'An error occurred' });
    }
});
exports.register = register;
