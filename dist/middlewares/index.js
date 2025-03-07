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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = exports.isAuthenticated = void 0;
const lodash_1 = require("lodash");
const Users_1 = require("../db/Users");
const mongoose_1 = __importDefault(require("mongoose")); // استيراد mongoose
// ✅ Middleware للتحقق من المستخدم المصادق عليه
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(" isAuthenticated Middleware Triggered!");
        const sessionToken = req.cookies["VORTEX-AUTH"];
        console.log(" Session Token:", sessionToken);
        if (!sessionToken) {
            console.log(" No session token found, sending 403");
            res.sendStatus(403);
            return; // التأكد من أنه لا يوجد قيمة مرجعة بعد الاستجابة
        }
        const existingUser = yield (0, Users_1.getUserBySessionToken)(sessionToken);
        console.log(" Existing User:", existingUser);
        if (!existingUser) {
            console.log(" No user found for session token, sending 403");
            res.sendStatus(403);
            return; // التأكد من أنه لا يوجد قيمة مرجعة بعد الاستجابة
        }
        (0, lodash_1.merge)(req, { identity: existingUser });
        console.log(` User authenticated: ${existingUser._id}`);
        next();
    }
    catch (error) {
        console.error(" Error in isAuthenticated:", error);
        res.sendStatus(400); // تعديل الاستجابة لتكون 400 بدلاً من 403 في حالة الخطأ
    }
});
exports.isAuthenticated = isAuthenticated;
// ✅ Middleware للتحقق من أن المستخدم هو المالك
const isOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(" isOwner Middleware Triggered!");
        const { id } = req.params; // معرف المستخدم المطلوب
        console.log(" Requested ID:", id);
        // التأكد من أن currentUserId هو ObjectId أو string
        let currentUserId = (0, lodash_1.get)(req, "identity._id");
        console.log(" Raw Current User ID:", currentUserId);
        // التأكد من أن currentUserId يحتوي على قيمة صالحة
        if (!currentUserId) {
            console.log(" No valid user ID found, sending 403");
            res.sendStatus(403);
            return;
        }
        // التأكد من أن currentUserId هو من النوع ObjectId
        if (mongoose_1.default.Types.ObjectId.isValid(currentUserId)) {
            // إذا كان currentUserId صالحاً كـ ObjectId
            currentUserId = new mongoose_1.default.Types.ObjectId(currentUserId).toHexString(); // تحويل ObjectId إلى string
        }
        else if (typeof currentUserId !== "string") {
            console.log(" Invalid user ID type, sending 403");
            res.sendStatus(403);
            return;
        }
        console.log(" Converted User ID to String:", currentUserId);
        // تحقق من تطابق الـ ID مع المستخدم الحالي
        if (currentUserId !== id) {
            console.log(` User ID mismatch (Expected: ${currentUserId}, Received: ${id}), sending 403`);
            res.sendStatus(403);
            return;
        }
        console.log(" User is the owner, proceeding...");
        next();
    }
    catch (error) {
        console.log(" Error in isOwner:", error);
        res.sendStatus(403);
    }
});
exports.isOwner = isOwner;
