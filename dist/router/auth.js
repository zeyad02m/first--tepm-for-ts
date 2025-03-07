"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aut_1 = require("../controllers/aut");
exports.default = (router) => {
    router.post('/auth/register', aut_1.register);
    router.post('/auth/login', aut_1.login);
};
