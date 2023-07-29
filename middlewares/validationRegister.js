const joi = require("joi");

const validateRegister = async (req, res, next) => {
  const payload = req.body;
  try {
    await validatePayload.validateAsync(payload);
    next();
  } catch (error) {
    console.log(error);
    return res.status(406).send(error.details[0].message);
  }
};

const validatePayload = joi.object({
  first_name: joi.string().min(5).max(255).required(),
  last_name: joi.string().min(5).max(255).required(),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: joi.string().min(5).max(255).required(),
});

module.exports = validateRegister;
