{ lib }:
let
  contextCapTokens = 300000;
  keepRecentTokens = 60000;
  # Pi compacts above contextWindow - reserveTokens and matches overrides by exact provider/model keys.
  largeContextWindows = {
    "claude-bridge/claude-fable-5" = 1000000;
    "claude-bridge/claude-fable-5-1" = 1000000;
    "claude-bridge/claude-haiku-5-5" = 1000000;
    "claude-bridge/claude-opus-4-6" = 1000000;
    "claude-bridge/claude-opus-4-7" = 1000000;
    "claude-bridge/claude-opus-4-8" = 1000000;
    "claude-bridge/claude-opus-5" = 1000000;
    "claude-bridge/claude-opus-5-5" = 1000000;
    "claude-bridge/claude-sonnet-5" = 1000000;
    "claude-bridge/claude-sonnet-5-5" = 1000000;
    "opencode-go/beam-free" = 1048576;
    "opencode-go/claude-haiku-5-5" = 1000000;
    "opencode-go/deepseek-v4-pro" = 1000000;
    "opencode-go/deepseek-v4.1-flash" = 1000000;
    "opencode-go/gemini-4-argon-contributor" = 1048576;
    "opencode-go/glm-5.2" = 1000000;
    "opencode-go/glm-5.3" = 1000000;
    "opencode-go/glm-5.3-flash" = 1000000;
    "opencode-go/gpt-5.6-luna" = 1050000;
    "opencode-go/gpt-6-luna" = 1050000;
    "opencode-go/hy4-preview" = 1024000;
    "opencode-go/kimi-k3" = 1048576;
    "opencode-go/longcat-2.0" = 1000000;
    "opencode-go/longcat-2.5-preview-free" = 1000000;
    "opencode-go/mimo-v2.5" = 1000000;
    "opencode-go/mimo-v2.5-pro" = 1048576;
    "opencode-go/mimo-v2.6-flash" = 1048576;
    "opencode-go/mimo-v2.6-pro" = 1048576;
    "opencode-go/minimax-m3" = 1000000;
    "opencode-go/minimax-m3.1-flash" = 1000000;
    "opencode-go/minimax-m3.1-flash-free" = 1000000;
    "opencode-go/muse-spark-1.2-contributor" = 1048576;
    "opencode-go/muse-spark-1.3-contributor" = 1048576;
    "opencode-go/qwen3.7-plus" = 1000000;
    "opencode-go/qwen3.8-flash" = 1000000;
    "opencode-go/qwen3.8-max" = 1000000;
    "opencode-go/step-5-preview" = 1000000;
  };
in
{
  modelOverrides = lib.mapAttrs (_: contextWindow: {
    reserveTokens = contextWindow - contextCapTokens;
    inherit keepRecentTokens;
  }) largeContextWindows;
}
