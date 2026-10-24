import { type ExtensionContext, ModelRuntime } from "@earendil-works/pi-coding-agent";

export async function createTaskModelRuntime(ctx: Pick<ExtensionContext, "modelRegistry">): Promise<ModelRuntime> {
  const runtime = await ModelRuntime.create();
  const registry = ctx.modelRegistry;
  for (const providerId of registry.getRegisteredProviderIds()) {
    const nativeProvider = registry.getRegisteredNativeProvider(providerId);
    if (nativeProvider) {
      runtime.registerNativeProvider(nativeProvider);
      continue;
    }
    const providerConfig = registry.getRegisteredProviderConfig(providerId);
    if (providerConfig) runtime.registerProvider(providerId, providerConfig);
  }

  return runtime;
}
