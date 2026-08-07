import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { generateToken } from '../utils/jwtHelper.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const registerPatient = async (patientData) => {
  const { firstName, lastName, email, phone, password, gender, dateOfBirth, address } = patientData;

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    throw new Error('User already exists with this email or phone');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: 'Patient',
  });

  await Patient.create({
    userId: user._id,
    gender,
    dateOfBirth,
    address,
  });

  const token = generateToken(user._id, user.email, user.role);
  return { user: { _id: user._id, firstName, lastName, email, role: user.role }, token };
};

export const registerDoctor = async (doctorData) => {
  const { firstName, lastName, email, phone, password, licenseNumber, consultationFee, specializationId } = doctorData;

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    throw new Error('User already exists with this email or phone');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: 'Doctor',
  });

  await Doctor.create({
    userId: user._id,
    licenseNumber,
    consultationFee,
    specializationId: specializationId || null,
  });

  const token = generateToken(user._id, user.email, user.role);
  return { user: { _id: user._id, firstName, lastName, email, role: user.role }, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.isBlocked) {
    throw new Error('Your account has been blocked by admin');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id, user.email, user.role);
  const refreshToken = generateToken(user._id, user.email, user.role); // In prod, use generateRefreshToken
  return { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isVerified: user.isVerified }, token, refreshToken };
};

export const refreshTokenService = async (tokenStr) => {
  try {
    const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    
    const token = generateToken(user._id, user.email, user.role);
    return { token };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('There is no user with that email');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

  await user.save({ validateBeforeSave: false });
  return resetToken;
};

export const resetPassword = async (resetToken, newPassword) => {
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  if (!(await user.matchPassword(currentPassword))) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
};
