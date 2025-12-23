import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { sendErrorResponse, sendSuccessResponse } from "../utility";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "../utility/email";

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: "password123"
 *         tronAddress:
 *           type: string
 *           description: User's TRON wallet address
 *           example: "TRx...abc"
 *         tronPrivateKey:
 *           type: string
 *           description: User's TRON private key
 *           example: "private_key_here"
 *         tronMnemonic:
 *           type: string
 *           description: User's TRON mnemonic phrase
 *           example: "word1 word2 word3..."
 *         bnbAddress:
 *           type: string
 *           description: User's BNB wallet address
 *           example: "0x...abc"
 *         bnbPrivateKey:
 *           type: string
 *           description: User's BNB private key
 *           example: "private_key_here"
 *         bnbMnemonic:
 *           type: string
 *           description: User's BNB mnemonic phrase
 *           example: "word1 word2 word3..."
 *     SignupResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: User's ID
 *               example: 1
 *             email:
 *               type: string
 *               description: User's email address
 *               example: user@example.com
 *             tronAddress:
 *               type: string
 *               description: User's TRON wallet address
 *               example: "TRx...abc"
 *             bnbAddress:
 *               type: string
 *               description: User's BNB wallet address
 *               example: "0x...abc"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Account creation timestamp
 *               example: "2024-03-27T12:00:00Z"
 *             token:
 *               type: string
 *               description: JWT authentication token
 *               example: "eyJhbGciOiJIUzI1NiIs..."
 *         message:
 *           type: string
 *           description: Success message
 *           example: "User registered successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "User already exists"
 */

export const SignupController = {

  /**
   * @swagger
   * /api/signup:
   *   post:
   *     summary: Register a new user
   *     description: Create a new user account with email, password, and wallet information
   *     tags: [Signup]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignupRequest'
   *     responses:
   *       200:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SignupResponse'
   *       400:
   *         description: Invalid request or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  register: async (req: Request, res: Response) => {
    console.log('📝 Signup Request:', {
      body: { ...req.body, password: '[REDACTED]' },
      headers: req.headers,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    try {
      const {
        email,
        tronAddress,
        tronPrivateKey,
        tronMnemonic,
        bnbAddress,
        bnbPrivateKey,
        bnbMnemonic,
      } = req.body;

      // Send wallet details via email
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Your Vcap Wallet Details</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666;">Your wallet details are as follows:</p>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #2c3e50;">TRON Wallet</h3>
              <p><strong>Address:</strong> <span style="font-family: monospace;">${tronAddress}</span></p>
              <p><strong>Private Key:</strong> <span style="font-family: monospace;">${tronPrivateKey}</span></p>
              <p><strong>Mnemonic:</strong> <span style="font-family: monospace;">${tronMnemonic}</span></p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #2c3e50;">BNB Wallet</h3>
              <p><strong>Address:</strong> <span style="font-family: monospace;">${bnbAddress}</span></p>
              <p><strong>Private Key:</strong> <span style="font-family: monospace;">${bnbPrivateKey}</span></p>
              <p><strong>Mnemonic:</strong> <span style="font-family: monospace;">${bnbMnemonic}</span></p>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ IMPORTANT SECURITY NOTICE</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share your private keys or mnemonic phrases with anyone</li>
              <li>Store these details in a secure location</li>
              <li>Vcap will never ask for your private keys or mnemonic phrases</li>
              <li>Consider using a hardware wallet for additional security</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;">
            <p>This is an automated message, please do not reply.</p>
            <p>© ${new Date().getFullYear()} Vcap. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: "Your Vcap Wallet Details - Keep This Information Secure",
        html: emailContent,
      });

      console.log('📧 Wallet details sent to email:', email);

      return sendSuccessResponse(res, { 
        message: "Wallet details sent successfully to your email"
      });
    } catch (error: any) {
      console.error('❌ Error in sending wallet details:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      return sendErrorResponse(res, error.message || "Failed to send wallet details", 500);
    }
  },

  /**
   * @swagger
   * /api/resendOtp:
   *   post:
   *     summary: Resend OTP to the user's email
   *     description: Sends a new OTP to the user's registered email address.
   *     tags: [Signup]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: OTP sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "OTP sent successfully"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User not found"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Something went wrong"
   */
  resendOtp: async (req: Request, res: Response) => {

    try {
      const { email } = req.body;

      const user = await prisma.userSignup.findUnique({
        where: { email },
      });

      if (!user) {
        return sendErrorResponse(res, "User not found", 404);
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Update the user's OTP and expiration
      await prisma.userSignup.update({
        where: { id: user.id },
        data: {
          emailOtp: otp,
          emailOtpExpires: otpExpires,
        },
      });

      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      });

      console.log('OTP sent successfully to email =====>', email);

      return sendSuccessResponse(res, { message: "OTP sent successfully" });
    } catch (error: any) {
      console.error('Error in resend OTP process ==>', error);
      return sendErrorResponse(res, error.message || "Something went wrong", 500);
    }
  },

  /**
   * @swagger
   * /api/verifyOtp:
   *   post:
   *     summary: Verify OTP for the user's email
   *     description: Verifies the OTP sent to the user's email address.
   *     tags: [Signup]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *                 example: user@example.com
   *               otp:
   *                 type: string
   *                 description: OTP sent to the user's email
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: OTP verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "OTP verified successfully"
   *       400:
   *         description: Invalid or expired OTP
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Invalid or expired OTP"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User not found"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Something went wrong"
   */
  verifyOtp: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;

      console.log('🔍 Checking for user with email:', email);

      // Check if the user exists
      const user = await prisma.userSignup.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('❌ User not found:', email);
        return sendErrorResponse(res, "User not found", 404);
      }

      console.log('🔍 Validating OTP for user:', email);

      // Check if OTP matches and is not expired
      if (
        user.emailOtp !== otp ||
        !user.emailOtpExpires ||
        new Date() > user.emailOtpExpires
      ) {
        console.log('❌ Invalid or expired OTP for user:', email);
        return sendErrorResponse(res, "Invalid or expired OTP", 400);
      }

      console.log('✅ OTP verified successfully for user:', email);

      // Mark OTP as verified
      await prisma.userSignup.update({
        where: { email },
        data: {
          emailOtp: null,
          emailOtpExpires: null,
          emailOtpVerified: true,
        },
      });

      return sendSuccessResponse(res, { 
        message: "OTP verified successfully",
        userId: user.id
      });
    } catch (error: any) {
      console.error('❌ Error in verify OTP process:', error);
      return sendErrorResponse(res, error.message || "Something went wrong", 500);
    }
  },

  /**
   * @swagger
   * /api/simple-signup:
   *   post:
   *     summary: Register a new user with just email and password
   *     description: Create a new user account with only email and password, then send OTP
   *     tags: [Signup]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       200:
   *         description: User registered successfully and OTP sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User registered successfully. OTP sent to email"
   *       400:
   *         description: Invalid request or user already exists
   *       500:
   *         description: Server error
   */
  simpleRegister: async (req: Request, res: Response) => {
    console.log('📝 Simple Signup Request:', {
      body: { ...req.body, password: '[REDACTED]' },
      headers: req.headers,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.userSignup.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log('❌ User already exists:', email);
        return sendErrorResponse(res, "User already exists", 400);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Create new user with just email and password
      const user = await prisma.userSignup.create({
        data: {
          email,
          password: hashedPassword,
          emailOtp: otp,
          emailOtpExpires: otpExpires,
          emailOtpVerified: false,
        },
      });

      // Send OTP via email
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Your Vcap Verification Code</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666;">Your verification code is:</p>
            <h1 style="text-align: center; color: #2c3e50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;">
            <p>This is an automated message, please do not reply.</p>
            <p>© ${new Date().getFullYear()} Vcap. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: "Your Vcap Verification Code",
        html: emailContent,
      });

      console.log('✅ User created and OTP sent successfully:', {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      });

      return sendSuccessResponse(res, { 
        message: "User registered successfully. OTP sent to email",
        userId: user.id
      });
    } catch (error: any) {
      console.error('❌ Error in simple signup process:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        timestamp: new Date().toISOString()
      });

      if (error.code === "P2002") {
        return sendErrorResponse(res, "Email already exists", 400);
      }

      return sendErrorResponse(res, error.message || "Something went wrong", 500);
    }
  },

}; 
