import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
