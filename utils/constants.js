// Constants for the application

// Carbon emission factors (kg CO2 per unit)
const CARBON_EMISSION_FACTORS = {
  transport: 0.2, // kg CO2 per km
  food: 1.5,      // kg CO2 per kg of food
  energy: 0.5     // kg CO2 per kWh
};

// Default JWT secret (should be overridden by environment variable in production)
const DEFAULT_JWT_SECRET = 'climate_secret_key';

// Default database configuration
const DEFAULT_DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  database: 'climate_platform',
  password: 'postgres',
  port: 5432,
};

// Pagination defaults
const PAGINATION_DEFAULTS = {
  limit: 20,
  offset: 0
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// User roles
const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

module.exports = {
  CARBON_EMISSION_FACTORS,
  DEFAULT_JWT_SECRET,
  DEFAULT_DB_CONFIG,
  PAGINATION_DEFAULTS,
  HTTP_STATUS,
  USER_ROLES
};