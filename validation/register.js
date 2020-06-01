const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!validator.isLength(data.name, { nim: 2, max: 30 })) {
    errors.name = "Name must be more than 2 and less then 30 characters";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "name is required...";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "email is required";
  }
  if (!validator.isEmail(data.email)) {
    errors.email = "invalid email";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "password is required ";
  }
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "password must be at least 6 to 30 char long";
  }

  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  }
  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
