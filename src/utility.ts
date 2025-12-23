import { Prisma } from "@prisma/client";
import { NextFunction, Response, Request, Router } from "express";

import multer from "multer";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        `.${
          file.originalname.split(".")[file.originalname.split(".").length - 1]
        }`
    );
  },
});

export const upload = multer({ storage });
interface SuccessResponse<T> {
  status: "success";
  data: T;
}

interface ErrorResponse {
  status: "error";
  message: string;
}

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response {
  const response: SuccessResponse<T> = {
    status: "success",
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendErrorResponse(
  res: Response,
  message: string,
  statusCode: number = 400
): Response {
  const response: ErrorResponse = {
    status: "error",
    message,
  };
  return res.status(statusCode).json(response);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err); // Log the error for debugging purposes
  sendErrorResponse(res, "An unexpected error occurred", 500);
}

export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case "P2002":
      return "Unique constraint failed on the fields: " + error.meta?.target;
    // Add more Prisma error codes and their messages as needed
    default:
      return "Database error occurred";
  }
}

export function getStaticPath(error: Prisma.PrismaClientKnownRequestError) {}

export const isDev = () => process.env.NODE_ENV === "development";
