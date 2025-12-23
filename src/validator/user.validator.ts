import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { sendErrorResponse } from "../utility";

const createUserSchema = Joi.object({
  address: Joi.string().required().min(1).messages({
    "string.empty": "Address is not allowed to be empty",
    "any.required": "Address is required",
  }),
  message: Joi.string().required().min(1).messages({
    "string.empty": "Message is not allowed to be empty",
    "any.required": "Message is required",
  }),
  hash: Joi.string().required().min(1).messages({
    "string.empty": "Hash is not allowed to be empty",
    "any.required": "hash is required",
  }),
});

export interface CreateUserSchema {
  address: string;
  message: string;
  hash: string;
}

export const createUserValidationMiddleware = function validateCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return sendErrorResponse(
      res,
      error.details.map((detail) => detail.message).join(", ")
    );
  }

  next();
};
