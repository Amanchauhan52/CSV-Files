const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const validateCsvRow = (row = {}) => {
  const normalizedRow = {};
  const validationErrors = [];

  for (const [field, rawValue] of Object.entries(row)) {
    normalizedRow[field] = normalizeValue(rawValue);
  }

  const name = normalizeValue(normalizedRow.name);
  const email = normalizeValue(normalizedRow.email);
  const age = normalizeValue(normalizedRow.age);
  const department = normalizeValue(normalizedRow.department);

  normalizedRow.name = name;
  normalizedRow.email = email;
  normalizedRow.age = age;
  normalizedRow.department = department;

  if (!name) {
    validationErrors.push({
      field: "name",
      message: "Name is required",
      value: name ?? null,
      code: "REQUIRED",
    });
  }

  if (!email) {
    validationErrors.push({
      field: "email",
      message: "Email is required",
      value: email ?? null,
      code: "REQUIRED",
    });
  } else if (!emailPattern.test(email)) {
    validationErrors.push({
      field: "email",
      message: "Email format is invalid",
      value: email,
      code: "INVALID_EMAIL",
    });
  }

  if (age === null || age === undefined || age === "") {
    validationErrors.push({
      field: "age",
      message: "Age is required",
      value: age ?? null,
      code: "REQUIRED",
    });
  } else if (!/^\d+$/.test(String(age))) {
    validationErrors.push({
      field: "age",
      message: "Age must be numeric",
      value: age,
      code: "INVALID_NUMBER",
    });
  }

  if (!department) {
    validationErrors.push({
      field: "department",
      message: "Department is required",
      value: department ?? null,
      code: "REQUIRED",
    });
  }

  return {
    normalizedRow,
    validationErrors,
    isValid: validationErrors.length === 0,
  };
};

export default validateCsvRow;
