import { Request, Response, NextFunction } from "express";
import { merge, get } from "lodash";
import { getUserBySessionToken } from "../db/Users";
import mongoose from "mongoose"; // استيراد mongoose

// ✅ Middleware للتحقق من المستخدم المصادق عليه
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log(" isAuthenticated Middleware Triggered!");

        const sessionToken = req.cookies["VORTEX-AUTH"];
        console.log(" Session Token:", sessionToken);

        if (!sessionToken) {
            console.log(" No session token found, sending 403");
            res.sendStatus(403);
            return; // التأكد من أنه لا يوجد قيمة مرجعة بعد الاستجابة
        }

        const existingUser = await getUserBySessionToken(sessionToken);
        console.log(" Existing User:", existingUser);

        if (!existingUser) {
            console.log(" No user found for session token, sending 403");
            res.sendStatus(403);
            return; // التأكد من أنه لا يوجد قيمة مرجعة بعد الاستجابة
        }

        merge(req, { identity: existingUser });

        console.log(` User authenticated: ${existingUser._id}`);
        next();
    } catch (error) {
        console.error(" Error in isAuthenticated:", error);
        res.sendStatus(400); // تعديل الاستجابة لتكون 400 بدلاً من 403 في حالة الخطأ
    }
};

// ✅ Middleware للتحقق من أن المستخدم هو المالك
export const isOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log(" isOwner Middleware Triggered!");

        const { id } = req.params; // معرف المستخدم المطلوب
        console.log(" Requested ID:", id);

        // التأكد من أن currentUserId هو ObjectId أو string
        let currentUserId: string | undefined = get(req, "identity._id");
        console.log(" Raw Current User ID:", currentUserId);

        // التأكد من أن currentUserId يحتوي على قيمة صالحة
        if (!currentUserId) {
            console.log(" No valid user ID found, sending 403");
            res.sendStatus(403);
            return;
        }

        // التأكد من أن currentUserId هو من النوع ObjectId
        if (mongoose.Types.ObjectId.isValid(currentUserId)) {
            // إذا كان currentUserId صالحاً كـ ObjectId
            currentUserId = new mongoose.Types.ObjectId(currentUserId).toHexString(); // تحويل ObjectId إلى string
        } else if (typeof currentUserId !== "string") {
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
    } catch (error) {
        console.log(" Error in isOwner:", error);
        res.sendStatus(403);
    }
};
