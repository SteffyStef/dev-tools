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
exports.getGitApi = exports.ForcePushMode = void 0;
const vscode = require("vscode");
var ForcePushMode;
(function (ForcePushMode) {
    ForcePushMode[ForcePushMode["Force"] = 0] = "Force";
    ForcePushMode[ForcePushMode["ForceWithLease"] = 1] = "ForceWithLease";
})(ForcePushMode = exports.ForcePushMode || (exports.ForcePushMode = {}));
function getGitApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = vscode.extensions.getExtension("vscode.git");
        if (!extension) {
            return;
        }
        if (!extension.isActive) {
            yield extension.activate();
        }
        return extension.exports.getAPI(1);
    });
}
exports.getGitApi = getGitApi;
//# sourceMappingURL=git.js.map