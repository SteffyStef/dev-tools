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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchForChanges = exports.ensureStatusBarItem = exports.commit = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const git_1 = require("./git");
const luxon_1 = require("luxon");
const store_1 = require("./store");
const mobx_1 = require("mobx");
const minimatch = require("minimatch");
const REMOTE_NAME = "origin";
function pushRepository(repository, forcePush = false) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield hasRemotes(repository)))
            return;
        store_1.store.isPushing = true;
        try {
            if (config_1.default.autoPull === "onPush") {
                yield pullRepository(repository);
            }
            const pushArgs = [REMOTE_NAME, (_a = repository.state.HEAD) === null || _a === void 0 ? void 0 : _a.name, false];
            if (forcePush) {
                pushArgs.push(git_1.ForcePushMode.Force);
            }
            else if (config_1.default.pushMode !== "push") {
                const pushMode = config_1.default.pushMode === "forcePush"
                    ? git_1.ForcePushMode.Force
                    : git_1.ForcePushMode.ForceWithLease;
                pushArgs.push(pushMode);
            }
            yield repository.push(...pushArgs);
            store_1.store.isPushing = false;
        }
        catch (_b) {
            store_1.store.isPushing = false;
            if (yield vscode.window.showWarningMessage("Remote repository contains conflicting changes.", "Force Push")) {
                yield pushRepository(repository, true);
            }
        }
    });
}
function pullRepository(repository) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield hasRemotes(repository)))
            return;
        store_1.store.isPulling = true;
        yield repository.pull();
        store_1.store.isPulling = false;
    });
}
function hasRemotes(repository) {
    return __awaiter(this, void 0, void 0, function* () {
        const refs = yield repository.getRefs();
        return refs.some((ref) => ref.type === 1 /* RefType.RemoteHead */);
    });
}
function matches(uri) {
    return minimatch(uri.path, config_1.default.filePattern, { dot: true });
}
function generateCommitMessage(repository, changedUris) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const diffs = yield Promise.all(changedUris.map((uri) => __awaiter(this, void 0, void 0, function* () {
            const filePath = vscode.workspace.asRelativePath(uri);
            const fileDiff = yield repository.diffWithHEAD(filePath);
            return `## ${filePath}
---
${fileDiff}`;
        })));
        const model = yield vscode.lm.selectChatModels({ family: config_1.default.aiModel });
        if (!model || model.length === 0)
            return null;
        const prompt = `# Base Instructions

* Summarize the following source code diffs into a single concise sentence that describes the essence of the changes that were made, and can be used as a commit message.
* Always start the commit message with a present tense verb such as "Update", "Fix", "Modify", "Add", "Improve", "Organize", "Arrange", etc.
* Respond in plain text, with no markdown formatting, and without any extra content. Simply respond with the commit message, and without a trailing period.
* Don't reference the file paths that were changed, but make sure summarize all significant changes.
${config_1.default.aiUseEmojis ? "* Prepend an emoji to the message that best expresses the nature of the changes, and is as specific to the subject and action of the changes as possible.\n" : ""}
# Code change diffs

${diffs.join("\n\n")}

${config_1.default.aiCustomInstructions ? `# User-Provided Instructions (Important!)
  
${config_1.default.aiCustomInstructions}
` : ""}
# Commit message

`;
        const response = yield model[0].sendRequest([{
                role: vscode.LanguageModelChatMessageRole.User,
                name: "User",
                content: prompt
            }]);
        let summary = "";
        try {
            for (var _b = __asyncValues(response.text), _c; _c = yield _b.next(), !_c.done;) {
                const part = _c.value;
                summary += part;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return summary;
    });
}
function commit(repository, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [
            ...repository.state.workingTreeChanges,
            ...repository.state.mergeChanges,
            ...repository.state.indexChanges,
        ];
        if (changes.length === 0)
            return;
        const changedUris = changes
            .filter((change) => matches(change.uri))
            .map((change) => change.uri);
        if (changedUris.length === 0)
            return;
        if (config_1.default.commitValidationLevel !== "none") {
            const diagnostics = vscode.languages
                .getDiagnostics()
                .filter(([uri, diagnostics]) => {
                const isChanged = changedUris.find((changedUri) => changedUri.toString().localeCompare(uri.toString()) === 0);
                return isChanged
                    ? diagnostics.some((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error ||
                        (config_1.default.commitValidationLevel === "warning" &&
                            diagnostic.severity === vscode.DiagnosticSeverity.Warning))
                    : false;
            });
            if (diagnostics.length > 0) {
                return;
            }
        }
        let currentTime = luxon_1.DateTime.now();
        // Ensure that the commit dates are formatted
        // as UTC, so that other clients can properly
        // re-offset them based on the user's locale.
        const commitDate = currentTime.toUTC().toString();
        process.env.GIT_AUTHOR_DATE = commitDate;
        process.env.GIT_COMMITTER_DATE = commitDate;
        if (config_1.default.timeZone) {
            currentTime = currentTime.setZone(config_1.default.timeZone);
        }
        let commitMessage = message || currentTime.toFormat(config_1.default.commitMessageFormat);
        if (config_1.default.aiEnabled) {
            const aiMessage = yield generateCommitMessage(repository, changedUris);
            if (aiMessage) {
                commitMessage = aiMessage;
            }
        }
        yield repository.commit(commitMessage, { all: true, noVerify: config_1.default.noVerify });
        delete process.env.GIT_AUTHOR_DATE;
        delete process.env.GIT_COMMITTER_DATE;
        if (config_1.default.autoPush === "onCommit") {
            yield pushRepository(repository);
        }
        if (config_1.default.autoPull === "onCommit") {
            yield pullRepository(repository);
        }
    });
}
exports.commit = commit;
function debounce(fn, delay) {
    let timeout = null;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
const commitMap = new Map();
function debouncedCommit(repository) {
    if (!commitMap.has(repository)) {
        commitMap.set(repository, debounce(() => commit(repository), config_1.default.autoCommitDelay));
    }
    return commitMap.get(repository);
}
let statusBarItem = null;
function ensureStatusBarItem() {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(mirror)";
        statusBarItem.tooltip = "GitDoc: Auto-commiting files on save";
        statusBarItem.command = "gitdoc.disable";
        statusBarItem.show();
    }
    return statusBarItem;
}
exports.ensureStatusBarItem = ensureStatusBarItem;
let disposables = [];
function watchForChanges(git) {
    const commitAfterDelay = debouncedCommit(git.repositories[0]);
    disposables.push(git.repositories[0].state.onDidChange(commitAfterDelay));
    ensureStatusBarItem();
    disposables.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && matches(editor.document.uri)) {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.show();
        }
        else {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.hide();
        }
    }));
    if (vscode.window.activeTextEditor &&
        matches(vscode.window.activeTextEditor.document.uri)) {
        statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.show();
    }
    else {
        statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.hide();
    }
    disposables.push({
        dispose: () => {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.dispose();
            statusBarItem = null;
        },
    });
    if (config_1.default.autoPush === "afterDelay") {
        const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            pushRepository(git.repositories[0]);
        }), config_1.default.autoPushDelay);
        disposables.push({
            dispose: () => {
                clearInterval(interval);
            },
        });
    }
    if (config_1.default.autoPull === "afterDelay") {
        const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () { return pullRepository(git.repositories[0]); }), config_1.default.autoPullDelay);
        disposables.push({
            dispose: () => clearInterval(interval),
        });
    }
    const reactionDisposable = (0, mobx_1.reaction)(() => [store_1.store.isPushing, store_1.store.isPulling], () => {
        const suffix = store_1.store.isPushing
            ? " (Pushing...)"
            : store_1.store.isPulling
                ? " (Pulling...)"
                : "";
        statusBarItem.text = `$(mirror)${suffix}`;
    });
    disposables.push({
        dispose: reactionDisposable,
    });
    if (config_1.default.pullOnOpen) {
        pullRepository(git.repositories[0]);
    }
    return {
        dispose: () => {
            disposables.forEach((disposable) => disposable.dispose());
            disposables = [];
        },
    };
}
exports.watchForChanges = watchForChanges;
//# sourceMappingURL=watcher.js.map