import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { sendErrorResponse } from "../utility";

export interface LoginAdminSchema {
  username: string;
  password: string;
}

const loginAdminSchema = Joi.object({
  username: Joi.string().required().min(1).messages({
    "string.empty": "Username is not allowed to be empty",
    "any.required": "Username is required",
  }),
  password: Joi.string().required().min(1).messages({
    "string.empty": "Password is not allowed to be empty",
    "any.required": "Password is required",
  }),
});

export const loginAdminValidationMiddleware = function validateAdminLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = loginAdminSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return sendErrorResponse(
      res,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  next();
};
