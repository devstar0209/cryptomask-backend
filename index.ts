import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { AdminRouter } from "./src/routes/admin/AdminRoute";
import { UserRouter } from "./src/routes/user/UserRoute";
import signupRouter from "./src/routes/signup.routes";
import { initMessaging } from "./src/messaging";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const prisma = new PrismaClient();

require("dotenv").config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*", allowedHeaders: ["Authorization"] },
  transports: ["websocket"],
});

initMessaging();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cryptomask API Documentation",
      version: "1.0.0",
      description: "API documentation for Cryptomask backend services",
    },
    servers: [
      {
        url: `http://localhost:${process.env.BACKEND_PORT || 3001}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/controller/*.ts", "./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (err: any, req: any, res: any, next: any) {
  res.send({ message: err.toString() });
  res.end();
});

prisma.appSetting.findMany().then(async (siteSettings: any) => {
  if (siteSettings.length === 0) {
    await prisma.appSetting.create({
      data: {
        helpUrl: "https://support.metamask.io/hc/en-us",
        privacyPolicyUrl: "https://metamask.io/privacy-policy/",
        termsAndConditionUrl: "https://metamask.io/terms-of-use/",
        aboutUs: "https://metamask.io/about/",
        fee: 10,
        adminAddress: "0xC593125f74EBd1452720090e78e368858cFbaA46",
      },
    });
  }
  app.use("/api/admin", AdminRouter);
  app.use("/api/user", UserRouter);
  app.use("/api", signupRouter);

  server.listen(process.env.BACKEND_PORT || 3001, () => {
    console.log(`LISTENTING ON PORT ${process.env.BACKEND_PORT || 3001}`);
    console.log(`Swagger documentation available at http://localhost:${process.env.BACKEND_PORT || 3001}/api-docs`);
  });
});
