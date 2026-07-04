import type { Rule } from "../types.js";
import { aiActionDetectedRule } from "./ai-action-detected.js";
import { aiOutputToSensitiveSinkRule } from "./ai-output-to-sensitive-sink.js";
import { floatingActionVersionRule } from "./floating-action-version.js";
import { missingExplicitPermissionsRule } from "./missing-explicit-permissions.js";
import { privilegedAgentTokenRule } from "./privileged-agent-token.js";
import { promptToScriptRule } from "./prompt-to-script.js";
import { pullRequestTargetAgentRule } from "./pull-request-target-agent.js";
import { pwnRequestCheckoutRule } from "./pwn-request-checkout.js";
import { secretsExposedToAgentRule } from "./secrets-exposed-to-agent.js";
import { untrustedContextToAgentPromptRule } from "./untrusted-context-to-agent-prompt.js";

export const rules: Rule[] = [
  aiActionDetectedRule,
  untrustedContextToAgentPromptRule,
  privilegedAgentTokenRule,
  pullRequestTargetAgentRule,
  promptToScriptRule,
  aiOutputToSensitiveSinkRule,
  pwnRequestCheckoutRule,
  floatingActionVersionRule,
  missingExplicitPermissionsRule,
  secretsExposedToAgentRule,
];
