"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContext = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const constants_1 = require("./constants");
const store_1 = require("./store");
const ENABLED_KEY = `${constants_1.EXTENSION_NAME}:enabled`;
function updateContext(enabled, updateConfig = true) {
    store_1.store.enabled = enabled;
    vscode.commands.executeCommand("setContext", ENABLED_KEY, enabled);
    if (updateConfig) {
        config_1.default.enabled = enabled;
    }
}
exports.updateContext = updateContext;
//# sourceMappingURL=utils.js.map