import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CreateUserSchema } from "../validator/user.validator";
import {
  handlePrismaError,
  isDev,
  sendErrorResponse,
  sendSuccessResponse,
} from "../utility";
import { verifyPersonalSign } from "../web3Utilities";
import { sign } from "jsonwebtoken";
import Moralis from "moralis";

const prisma = new PrismaClient();

Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *           description: The user's wallet address
 *         subAddress:
 *           type: array
 *           items:
 *             type: string
 *           description: Additional wallet addresses associated with the user
 *         seedPhraseBackedUp:
 *           type: boolean
 *           description: Whether the user has backed up their seed phrase
 *     CreateUserSchema:
 *       type: object
 *       required:
 *         - address
 *         - hash
 *         - message
 *       properties:
 *         address:
 *           type: string
 *           description: The user's wallet address
 *         hash:
 *           type: string
 *           description: The signed message hash
 *         message:
 *           type: string
 *           description: The message that was signed
 */

const getMediaType = (extension: string) => {
  if (
    extension.includes("png") ||
    extension.includes("jpg") ||
    extension.includes("jpeg") ||
    extension.includes("webp") ||
    extension.includes("gif")
  ) {
    return "image";
  }
  if (
    extension.includes("mp4") ||
    extension.includes("mkv") ||
    extension.includes("mov") ||
    extension.includes("avi")
  ) {
    return "video";
  }
  return "file";
};

export const UserController = {
  /**
   * @swagger
   * /api/user/create:
   *   post:
   *     summary: Create a new user or login if user exists
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserSchema'
   *     responses:
   *       200:
   *         description: User created or logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *                 token:
   *                   type: string
   *       400:
   *         description: Authentication error or invalid request
   */
  createUser: async (req: Request, res: Response) => {
    try {
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const existingUser = await prisma.user.findFirst({
        where: { address: { equals: address } },
      });
      if (isDev()) {
        console.log(existingUser);
      }

      if (existingUser) {
        return await UserController.loginUser(req, res);
      }
      const user = await prisma.user.create({ data: { address } });
      const token = sign(user, process.env.SECRET!);

      return sendSuccessResponse(res, {
        ...user,
        token: token,
      });
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
   * /api/user/add-account:
   *   post:
   *     summary: Add a new wallet address to existing user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserSchema'
   *     responses:
   *       200:
   *         description: Account added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Authentication error or invalid request
   */
  addAccount: async (req: Request, res: Response) => {
    try {
      const { address: mainAddress } = (req as any).user;
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const user = await prisma.user.findFirst({
        where: { address: { equals: mainAddress, mode: "insensitive" } },
      });
      if (user) {
        const alreadyExist = user.subAddress.find(
          (_address) => _address === address
        );
        const isMainAddress =
          mainAddress.toLowerCase() === address.toLowerCase();
        if (!alreadyExist && !isMainAddress) {
          user.subAddress.push(address);
        }
        const updatedUser = await prisma.user.update({
          where: { address: user!.address },
          data: user!,
        });
        return sendSuccessResponse(res, {
          ...updatedUser,
        });
      }
      return sendErrorResponse(res, "Something went wrong", 400);
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
   * /api/user/backed-up:
   *   post:
   *     summary: Mark user's seed phrase as backed up
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Seed phrase backup status updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid request
   */
  backedUp: async (req: Request, res: Response) => {
    try {
      const { address } = (req as any).user;
      const user = await prisma.user.findFirst({
        where: { address: { equals: address, mode: "insensitive" } },
      });
      if (user) {
        user.seedPhraseBackedUp = true;
        const updatedUser = await prisma.user.update({
          where: { address: user!.address },
          data: user,
        });
        return sendSuccessResponse(res, {
          ...updatedUser,
        });
      }
      return sendErrorResponse(res, "Something went wrong", 400);
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
   * /api/user/login:
   *   post:
   *     summary: Login existing user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserSchema'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *                 token:
   *                   type: string
   *       404:
   *         description: Wallet not found
   *       400:
   *         description: Authentication error
   */
  loginUser: async (req: Request, res: Response) => {
    try {
      const { address, hash, message } = req.body as CreateUserSchema;
      const isValid = verifyPersonalSign({ message, hash, address });
      if (!isValid) {
        return sendErrorResponse(res, "Authentication error", 400);
      }
      const user = await prisma.user.findFirst({ where: { address } });

      if (user) {
        const token = sign(user, process.env.SECRET!);
        if (isDev()) {
          console.log("SIGNING WITH ===> ", process.env.SECRET);
          console.log("USER TOKEN====> ", token);
        }

        return sendSuccessResponse(res, {
          ...user,
          token,
        });
      }
      return sendErrorResponse(res, "Wallet not found", 404);
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
   * /api/user/upload:
   *   post:
   *     summary: Upload a file attachment
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     url:
   *                       type: string
   *                     fileName:
   *                       type: string
   *                     mediaType:
   *                       type: string
   *       400:
   *         description: No file uploaded or invalid request
   */
  uploadAttachment: async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "Please upload file" });
      }
      const fileNamePart = file.path.split(".");
      const mediaType = getMediaType(fileNamePart[fileNamePart.length - 1]);
      return sendSuccessResponse(res, {
        url: `${req.protocol}://${req.headers.host}/${file.path}`,
        fileName: file.filename,
        mediaType: mediaType,
      });
    } catch (error: any) {
      return res.status(400).send({ message: error.toString() });
    }
  },
  /**
   * @swagger
   * /api/user/fee:
   *   get:
   *     summary: Get fee percentage and admin address
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Fee information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     fee:
   *                       type: number
   *                     adminAddress:
   *                       type: string
   */
  getFeePercentage: async (req: Request, res: Response) => {
    try {
      const siteSettings = await prisma.appSetting.findFirst();
      return sendSuccessResponse(res, {
        fee: siteSettings?.fee,
        adminAddress: siteSettings?.adminAddress,
      });
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  /**
   * @swagger
   * /api/user/settings:
   *   get:
   *     summary: Get application settings
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Settings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     helpUrl:
   *                       type: string
   *                     tcUrl:
   *                       type: string
   *                     ppUrl:
   *                       type: string
   *                     about:
   *                       type: string
   */
  settings: async (req: Request, res: Response) => {
    try {
      const siteSettings = await prisma.appSetting.findFirst();
      return sendSuccessResponse(res, {
        helpUrl: siteSettings?.helpUrl,
        tcUrl: siteSettings?.termsAndConditionUrl,
        ppUrl: siteSettings?.privacyPolicyUrl,
        about: siteSettings?.aboutUs,
      });
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  /**
   * @swagger
   * /api/user/tokens/{address}/{chainId}:
   *   get:
   *     summary: Get token balances for a wallet
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Wallet address
   *       - in: path
   *         name: chainId
   *         required: true
   *         schema:
   *           type: string
   *         description: Blockchain network ID
   *     responses:
   *       200:
   *         description: Token balances retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   */
  tokens: async (req: Request, res: Response) => {
    try {
      const { address, chainId } = req.params;

      const tokens = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
        address: address,
        chain: chainId,
      });
      if (isDev()) {
        console.log(JSON.stringify(tokens, null, 4));
      }
      return sendSuccessResponse(res, [...tokens.result]);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  /**
   * @swagger
   * /api/user/transactions/{address}/{tokenAddress}/{chainId}:
   *   get:
   *     summary: Get token transactions for a wallet
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Wallet address
   *       - in: path
   *         name: tokenAddress
   *         required: true
   *         schema:
   *           type: string
   *         description: Token contract address
   *       - in: path
   *         name: chainId
   *         required: true
   *         schema:
   *           type: string
   *         description: Blockchain network ID
   *     responses:
   *       200:
   *         description: Token transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   */
  tokenTransaction: async (req: Request, res: Response) => {
    try {
      const { address, tokenAddress, chainId } = req.params;

      const transfers = await Moralis.EvmApi.token.getWalletTokenTransfers({
        address: address,
        chain: chainId,
        contractAddresses: [tokenAddress],
      });
      if (isDev()) {
        console.log(JSON.stringify(transfers, null, 4));
      }

      return sendSuccessResponse(res, transfers.result);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  /**
   * @swagger
   * /api/user/wallet-transactions/{address}/{tokenAddress}/{chainId}:
   *   get:
   *     summary: Get wallet transactions
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Wallet address
   *       - in: path
   *         name: tokenAddress
   *         required: true
   *         schema:
   *           type: string
   *         description: Token contract address
   *       - in: path
   *         name: chainId
   *         required: true
   *         schema:
   *           type: string
   *         description: Blockchain network ID
   *     responses:
   *       200:
   *         description: Wallet transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   */
  walletTransaction: async (req: Request, res: Response) => {
    try {
      const { address, tokenAddress, chainId } = req.params;

      const activities = await Moralis.EvmApi.transaction.getWalletTransactions(
        {
          address: address,
          chain: chainId,
          limit: 100,
        }
      );
      if (isDev()) {
        console.log(JSON.stringify(activities, null, 4));
      }

      return sendSuccessResponse(res, activities.result);
    } catch (error: any) {
      return sendErrorResponse(res, error.toString());
    }
  },
  /**
   * @swagger
   * /api/user/{address}:
   *   delete:
   *     summary: Delete a user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Wallet address of user to delete
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid request or user not found
   */
   deleteUser: async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      // Delete from User table
      await prisma.user.delete({ where: { address: address } });
      console.log("User deleted successfully", address);

      // Delete from UserSignup table if exists
      try {
        await prisma.userSignup.deleteMany({ 
          where: { 
            OR: [
              { bnbAddress: address },
              { tronAddress: address }
            ]
          } 
        });
        console.log("UserSignup deleted successfully", address);
      } catch (signupError) {
        console.log("No UserSignup record found for address:", address);
      }

      return sendSuccessResponse(res, "User deleted successfully");
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = handlePrismaError(error);
        return sendErrorResponse(res, message, 400);
      }
      return sendErrorResponse(res, error.toString());
    }
  },
};
