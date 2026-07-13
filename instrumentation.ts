export async function register() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const { assertProductionSecretsConfigured } = await import("@/lib/env/secrets");

  try {
    assertProductionSecretsConfigured();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Production secret validation failed.",
    );
    throw error;
  }
}
