// backend/utils/validators.js
// Input validation utilities

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 6 characters
 */
const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate registration input
 */
const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push("Password must be at least 6 characters long");
  }

  const validRoles = ["player", "coach", "admin", "scout"];
  if (data.role && !validRoles.includes(data.role)) {
    errors.push("Invalid role. Must be player, coach, admin, or scout");
  }

  // Optional age validation
  if (data.age !== undefined && data.age !== null && data.age !== "") {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 5 || age > 100) {
      errors.push("Age must be between 5 and 100");
    }
  }

  // Optional gender validation
  if (data.gender && data.gender !== "") {
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(data.gender)) {
      errors.push("Gender must be male, female, or other");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate performance data
 */
const validatePerformance = (data) => {
  const errors = [];

  if (!data.sport || data.sport.trim().length < 2) {
    errors.push("Sport name is required");
  }

  const validateMetric = (value, name) => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.push(`${name} must be a number between 0 and 100`);
    }
  };

  validateMetric(data.speed, "Speed");
  validateMetric(data.stamina, "Stamina");
  validateMetric(data.strength, "Strength");

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration,
  validatePerformance,
  validateObjectId
};