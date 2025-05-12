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
exports.registerCommands = void 0;
const vscode = require("vscode");
const constants_1 = require("./constants");
const git_1 = require("./git");
const utils_1 = require("./utils");
const watcher_1 = require("./watcher");
function registerCommands(context) {
    function registerCommand(name, callback) {
        context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_NAME}.${name}`, callback));
    }
    registerCommand("enable", utils_1.updateContext.bind(null, true));
    registerCommand("disable", utils_1.updateContext.bind(null, false));
    registerCommand("restoreVersion", (item) => __awaiter(this, void 0, void 0, function* () {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        const path = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri.path);
        const git = yield (0, git_1.getGitApi)();
        // @ts-ignore
        yield (git === null || git === void 0 ? void 0 : git.repositories[0].repository.repository.checkout(item.ref, [
            path,
        ]));
        // TODO: Look into why the checkout
        // doesn't trigger the watcher.
        (0, watcher_1.commit)(git === null || git === void 0 ? void 0 : git.repositories[0]);
    }));
    registerCommand("squashVersions", (item) => __awaiter(this, void 0, void 0, function* () {
        const message = yield vscode.window.showInputBox({
            prompt: "Enter the name to give to the new squashed version",
            value: item.message,
        });
        if (message) {
            const git = yield (0, git_1.getGitApi)();
            // @ts-ignore
            yield (git === null || git === void 0 ? void 0 : git.repositories[0].repository.reset(`${item.ref}~1`));
            yield (0, watcher_1.commit)(git === null || git === void 0 ? void 0 : git.repositories[0], message);
        }
    }));
    registerCommand("undoVersion", (item) => __awaiter(this, void 0, void 0, function* () {
        const git = yield (0, git_1.getGitApi)();
        // @ts-ignore
        yield (git === null || git === void 0 ? void 0 : git.repositories[0].repository.repository.run([
            "revert",
            "-n",
            item.ref,
        ]));
        yield (0, watcher_1.commit)(git === null || git === void 0 ? void 0 : git.repositories[0]);
    }));
    registerCommand("commit", () => __awaiter(this, void 0, void 0, function* () {
        const git = yield (0, git_1.getGitApi)();
        if (git && git.repositories.length > 0) {
            yield (0, watcher_1.commit)(git.repositories[0]);
        }
    }));
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=commands.js.map