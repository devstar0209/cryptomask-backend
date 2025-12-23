import { Prisma, PrismaClient } from "@prisma/client";
import {
  handlePrismaError,
  sendErrorResponse,
  sendSuccessResponse,
} from "../utility";
import { CreateUserSchema } from "../validator/user.validator";
import { verifyPersonalSign } from "../web3Utilities";
import { LoginAdminSchema } from "../validator/admin.validator";
import { Request, Response } from "express";
import bycrpt from "bcrypt";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     AdminLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     AdminCreate:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - secret
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         secret:
 *           type: string
 *     Settings:
 *       type: object
 *       properties:
 *         helpUrl:
 *           type: string
 *         privacyPolicyUrl:
 *           type: string
 *         termsAndConditionUrl:
 *           type: string
 *         about:
 *           type: string
 *         fee:
 *           type: number
 */

type Settings = {
  helpUrl?: string;
  privacyPolicyUrl?: string;
  termsAndConditionUrl?: string;
  about?: string;
  fee?: number;
};

export const AdminController = {
  /**
   * @swagger
   * /api/admin/create:
   *   post:
   *     summary: Create a new admin user
   *     tags: [Admin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdminCreate'
   *     responses:
   *       200:
   *         description: Admin created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Admin'
   *       400:
   *         description: Authentication error or invalid request
   */
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, password, secret } = req.body;
      console.log("wfsdfsdf", username);
      if (process.env["SECRET"] === secret) {
        const hashedPassword = await bycrpt.hash(password, 10);
        const user = await prisma.admin.create({
          data: { username, password: hashedPassword },
        });
        return sendSuccessResponse(res, {
          ...user,
        });
      }
      return sendErrorResponse(res, "Not authenticated");
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },

  /**
   * @swagger
   * /api/admin/login:
   *   post:
   *     summary: Login as admin
   *     tags: [Admin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdminLogin'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: JWT token
   *       400:
   *         description: Invalid credentials
   */
  loginAdmin: async (req: Request, res: Response) => {
    const { username, password } = req.body as unknown as LoginAdminSchema;
    const admin = await prisma.admin.findFirst({
      where: { username: username },
    });
    if (!admin) {
      return sendErrorResponse(res, "Username or password invalid", 400);
    }
    const isValid = await bycrpt.compare(password, admin.password);
    if (!isValid) {
      return sendErrorResponse(res, "Username or password invalid", 400);
    }
    const token = sign(
      { ...admin, password: undefined },
      process.env.SECRET as any
    );
    return sendSuccessResponse(res, token, 200);
  },

  /**
   * @swagger
   * /api/admin/users:
   *   get:
   *     summary: Get all users
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   */
  users: async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return sendSuccessResponse(res, users, 200);
  },

  /**
   * @swagger
   * /api/admin/user/{userId}/deactivate:
   *   post:
   *     summary: Deactivate a user
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the user to deactivate
   *     responses:
   *       200:
   *         description: User deactivated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   */
  deactivateUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isDeactivated: true },
    });
    return sendSuccessResponse(res, users, 200);
  },

  /**
   * @swagger
   * /api/admin/user/{userId}/activate:
   *   post:
   *     summary: Activate a user
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the user to activate
   *     responses:
   *       200:
   *         description: User activated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   */
  activateUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isDeactivated: false },
    });
    return sendSuccessResponse(res, users, 200);
  },

  /**
   * @swagger
   * /api/admin/user/{userId}/block:
   *   post:
   *     summary: Block a user's transactions
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the user to block
   *     responses:
   *       200:
   *         description: User blocked successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   */
  blockUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isTransactionBlocked: true },
    });
    return sendSuccessResponse(res, users, 200);
  },

  /**
   * @swagger
   * /api/admin/user/{userId}/unblock:
   *   post:
   *     summary: Unblock a user's transactions
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the user to unblock
   *     responses:
   *       200:
   *         description: User unblocked successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   */
  unblockUser: async (req: Request, res: Response) => {
    const { userId } = req.params as any;
    const users = await prisma.user.update({
      where: { id: Number(userId) },
      data: { isTransactionBlocked: false },
    });
    return sendSuccessResponse(res, users, 200);
  },

  /**
   * @swagger
   * /api/admin/conversations:
   *   get:
   *     summary: Get all conversations
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all conversations
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   additionalProperties:
   *                     type: object
   *                     properties:
   *                       for:
   *                         $ref: '#/components/schemas/User'
   *                       attachment:
   *                         type: object
   */
  getConversations: async (req: Request, res: Response) => {
    let groupedMessagesByForId: any;
    const messages = await prisma.message.findMany({
      distinct: ["forId"],
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true, // Include sender information,
        attachment: true,
      },
    });
    messages.reverse();
    groupedMessagesByForId = messages.reduce((acc, message) => {
      const {
        for: { address },
      } = message;
      if (!acc[address]) {
        acc[address] = message;
      }
      return acc;
    }, {} as Record<string, (typeof messages)[0]>);
    return sendSuccessResponse(res, groupedMessagesByForId, 200);
  },

  /**
   * @swagger
   * /api/admin/settings:
   *   put:
   *     summary: Update application settings
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Settings'
   *     responses:
   *       200:
   *         description: Settings updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Settings'
   *       400:
   *         description: Invalid request
   */
  updateSettings: async (req: Request, res: Response) => {
    const updateSettings = req.body as Settings;
    try {
      const appSetting = await prisma.appSetting.findFirst();
      const settings = await prisma.appSetting.update({
        where: { id: appSetting?.id },
        data: updateSettings,
      });
      return sendSuccessResponse(res, settings, 200);
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },

  /**
   * @swagger
   * /api/admin/settings:
   *   get:
   *     summary: Get application settings
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Settings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Settings'
   *       400:
   *         description: Invalid request
   */
  settings: async (req: Request, res: Response) => {
    try {
      const appSetting = await prisma.appSetting.findFirst();

      return sendSuccessResponse(res, appSetting, 200);
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },

  /**
   * @swagger
   * /api/admin/conversations:
   *   delete:
   *     summary: Delete all conversations
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All conversations deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: null
   */
  deleteConversation: async (req: Request, res: Response) => {
    await prisma.message.deleteMany();

    return sendSuccessResponse(res, null, 200);
  },

  // Internal methods don't need Swagger documentation
  getConversationsWithoutRequest: async () => {
    let groupedMessagesByForId: any;
    const messages = await prisma.message.findMany({
      distinct: ["forId"],
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true,
        attachment: true,
      },
    });
    groupedMessagesByForId = messages.reduce((acc, message) => {
      const {
        for: { address },
      } = message;
      acc[address] = message;
      return acc;
    }, {} as Record<string, (typeof messages)[0]>);
    return groupedMessagesByForId;
  },
  getChatWithoutRequest: async (forId: number) => {
    const messages = await prisma.message.findMany({
      where: { forId: forId },
      orderBy: {
        timestamp: "desc",
      },
      include: {
        for: true,
        attachment: true,
      },
    });
    return messages;
  },
  markAsChatRead: async (forId: number) => {
    await prisma.message.updateMany({
      where: { forId: forId },
      data: { seen: true },
    });
  },
};
