import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";

// Generate JWT Token
const generateToken = (id: string): string => {
  // @ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      const error = new Error(
        "Please provide name, email, and password",
      ) as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      const error = new Error("Database connection not available") as AppError;
      error.statusCode = 503;
      throw error;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error(
        "User already exists with this email",
      ) as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "developer",
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      const validationError = new Error(errorMessages.join(", ")) as AppError;
      validationError.statusCode = 400;
      return next(validationError);
    }

    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const duplicateError = new Error(
        `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
      ) as AppError;
      duplicateError.statusCode = 400;
      return next(duplicateError);
    }

    // Handle other errors
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const error = new Error("Please provide email and password") as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      const error = new Error("Invalid credentials") as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials") as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      const validationError = new Error(errorMessages.join(", ")) as AppError;
      validationError.statusCode = 400;
      return next(validationError);
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateError = new Error("Email already exists") as AppError;
      duplicateError.statusCode = 400;
      return next(duplicateError);
    }

    // Handle other errors
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
