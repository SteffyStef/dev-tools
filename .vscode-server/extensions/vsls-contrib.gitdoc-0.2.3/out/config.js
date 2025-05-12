"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DEFAULT_DELAY_MS = 30000;
const ENABLED_KEY = "enabled";
function config() {
    return vscode.workspace.getConfiguration("gitdoc");
}
exports.default = {
    get autoCommitDelay() {
        return config().get("autoCommitDelay", DEFAULT_DELAY_MS);
    },
    get autoPull() {
        return config().get("autoPull", "onPush");
    },
    get autoPullDelay() {
        return config().get("autoPullDelay", DEFAULT_DELAY_MS);
    },
    get autoPush() {
        return config().get("autoPush", "onCommit");
    },
    get autoPushDelay() {
        return config().get("autoPushDelay", DEFAULT_DELAY_MS);
    },
    get commitMessageFormat() {
        return config().get("commitMessageFormat", "lll");
    },
    get commitValidationLevel() {
        return config().get("commitValidationLevel", "error");
    },
    get commitOnClose() {
        return config().get("commitOnClose", true);
    },
    get enabled() {
        return config().get(ENABLED_KEY, false);
    },
    set enabled(value) {
        config().update(ENABLED_KEY, value, vscode.ConfigurationTarget.Workspace);
    },
    get excludeBranches() {
        return config().get("excludeBranches", []);
    },
    get filePattern() {
        return config().get("filePattern", "**/*");
    },
    get noVerify() {
        return config().get("noVerify", false);
    },
    get pullOnOpen() {
        return config().get("pullOnOpen", true);
    },
    get pushMode() {
        return config().get("pushMode", "forcePush");
    },
    get timeZone() {
        return config().get("timeZone", null);
    },
    get aiEnabled() {
        return config().get("ai.enabled", false);
    },
    get aiModel() {
        return config().get("ai.model", "gpt-4o");
    },
    get aiCustomInstructions() {
        return config().get("ai.customInstructions", null);
    },
    get aiUseEmojis() {
        return config().get("ai.useEmojis", false);
    }
};
//# sourceMappingURL=config.js.map