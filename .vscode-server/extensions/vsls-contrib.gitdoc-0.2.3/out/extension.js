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
exports.deactivate = exports.activate = void 0;
const mobx_1 = require("mobx");
const vscode = require("vscode");
const commands_1 = require("./commands");
const config_1 = require("./config");
const git_1 = require("./git");
const store_1 = require("./store");
const watcher_1 = require("./watcher");
const utils_1 = require("./utils");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = yield (0, git_1.getGitApi)();
        if (!git) {
            return;
        }
        // Initialize the store based on the
        // user/workspace configuration.
        store_1.store.enabled = config_1.default.enabled;
        (0, commands_1.registerCommands)(context);
        // Enable/disable the auto-commit watcher as the user
        // opens/closes Git repos, modifies their settings
        // and/or manually enables it via the command palette.
        context.subscriptions.push(git.onDidOpenRepository(() => checkEnabled(git)));
        context.subscriptions.push(git.onDidCloseRepository(() => checkEnabled(git)));
        (0, mobx_1.reaction)(() => [store_1.store.enabled], () => checkEnabled(git));
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("gitdoc.enabled") ||
                e.affectsConfiguration("gitdoc.excludeBranches") ||
                e.affectsConfiguration("gitdoc.autoCommitDelay") ||
                e.affectsConfiguration("gitdoc.filePattern")) {
                checkEnabled(git);
            }
        }));
    });
}
exports.activate = activate;
let watcher;
function checkEnabled(git) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        if (watcher) {
            watcher.dispose();
            watcher = null;
        }
        let branchName = (_c = (_b = (_a = git.repositories[0]) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.HEAD) === null || _c === void 0 ? void 0 : _c.name;
        if (!branchName) {
            const refs = yield ((_d = git.repositories[0]) === null || _d === void 0 ? void 0 : _d.getRefs());
            branchName = (_e = refs === null || refs === void 0 ? void 0 : refs.find((ref) => ref.type === 0 /* RefType.Head */)) === null || _e === void 0 ? void 0 : _e.name;
        }
        const enabled = git.repositories.length > 0 &&
            store_1.store.enabled && !!branchName && !config_1.default.excludeBranches.includes(branchName);
        (0, utils_1.updateContext)(enabled, false);
        if (enabled) {
            watcher = (0, watcher_1.watchForChanges)(git);
        }
    });
}
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (store_1.store.enabled && config_1.default.commitOnClose) {
            const git = yield (0, git_1.getGitApi)();
            if (git && git.repositories.length > 0) {
                return (0, watcher_1.commit)(git.repositories[0]);
            }
        }
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map