const requiredEnvironmentVariables = ['TMDB_API_KEY'] as const;

type RequiredEnvironmentVariable = (typeof requiredEnvironmentVariables)[number];

function getMissingEnvironmentVariables() {
  return requiredEnvironmentVariables.filter(
    (name) => !process.env[name] || process.env[name]?.trim() === '',
  );
}

export function validateEnvironmentVariables() {
  const missingVariables = getMissingEnvironmentVariables();

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingVariables.join(', ')}. ` +
        'Set them in your environment before starting the app.',
    );
  }
}

validateEnvironmentVariables();

export function getRequiredEnvironmentVariable(name: RequiredEnvironmentVariable) {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(
      `Environment variable ${name} is required but was not provided. ` +
        'Ensure your .env configuration is loaded correctly.',
    );
  }

  return value;
}
