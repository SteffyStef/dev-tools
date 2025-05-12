"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const mobx_1 = require("mobx");
exports.store = (0, mobx_1.observable)({
    enabled: false,
    isPulling: false,
    isPushing: false,
});
//# sourceMappingURL=store.js.map