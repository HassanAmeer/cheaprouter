export interface CustomProviderModel {
  id: string;
  name: string;
}

export interface CustomProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: CustomProviderModel[];
}

const CUSTOM_PROVIDERS_STORAGE_KEY = "cheapchats_custom_providers";

export function getCustomProviderKey(id: string): string {
  return `custom:${id}`;
}

export function isAllowedCustomProviderUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export async function fetchCustomProviderModels(
  baseUrl: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<CustomProviderModel[]> {
  if (!isAllowedCustomProviderUrl(baseUrl)) {
    throw new Error("Enter a valid HTTP or HTTPS API URL without embedded credentials.");
  }

  const response = await fetch("/api/cheapchats/custom-provider", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, apiKey, action: "models" }),
    signal,
  });
  if (!response.ok) {
    let detail = "";
    try {
      const errorBody: unknown = await response.json();
      if (errorBody && typeof errorBody === "object" && "error" in errorBody && typeof errorBody.error === "string") {
        detail = ` ${errorBody.error}`;
      }
    } catch {
      // Keep the HTTP status as the actionable fallback when the proxy response is not JSON.
    }
    throw new Error(`Model list request failed (${response.status} ${response.statusText}).${detail}`);
  }

  const payload: unknown = await response.json();
  const models = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)
      ? payload.data
      : null;
  if (!models) {
    throw new Error("The API response did not contain a model list.");
  }

  return Array.from(
    new Map(
      models
        .filter(
          (model): model is { id: string; name?: string } =>
            !!model &&
            typeof model === "object" &&
            "id" in model &&
            typeof model.id === "string" &&
            model.id.trim().length > 0 &&
            (!("name" in model) || typeof model.name === "string")
        )
        .map((model) => [
          model.id.trim(),
          { id: model.id.trim(), name: model.name?.trim() || model.id.trim() },
        ])
    ).values()
  );
}

export function readCustomProviders(): CustomProvider[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROVIDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved custom providers data is not a list.");
    }
    return parsed.filter(
      (provider): provider is CustomProvider =>
        !!provider &&
        typeof provider === "object" &&
        typeof provider.id === "string" &&
        typeof provider.name === "string" &&
        typeof provider.baseUrl === "string" &&
        Array.isArray(provider.models) &&
        provider.models.every(
          (model: unknown) =>
            !!model &&
            typeof model === "object" &&
            typeof (model as CustomProviderModel).id === "string" &&
            typeof (model as CustomProviderModel).name === "string"
        )
    );
  } catch (error) {
    console.error("Failed to load custom providers:", error);
    return [];
  }
}

export function writeCustomProviders(providers: CustomProvider[]): void {
  localStorage.setItem(CUSTOM_PROVIDERS_STORAGE_KEY, JSON.stringify(providers));
}
