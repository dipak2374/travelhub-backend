import User from '../models/User.js';
import { generateToken, generateOTP } from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import { sendOTPEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, agencyProfile, partnerProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const allowedRoles = ['customer', 'travel_agency', 'car_rental_partner', 'bus_operator', 'airline_partner'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const userData = { name, email, password, phone, role: userRole };

    if (userRole === 'travel_agency') {
      userData.agencyProfile = {
        ...(agencyProfile || {}),
        isApproved: false,
      };
    }

    if (['car_rental_partner', 'bus_operator', 'airline_partner'].includes(userRole)) {
      userData.partnerProfile = {
        ...(partnerProfile || {}),
        isApproved: false,
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide your current password and a new password (min 6 chars).' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const bootstrapAdmin = async (req, res, next) => {
  try {
    const { secret, email, password, name, phone } = req.body;
    const bootstrapSecret = process.env.BOOTSTRAP_ADMIN_SECRET || process.env.ADMIN_BOOTSTRAP_SECRET;

    if (!bootstrapSecret) {
      return res.status(500).json({
        success: false,
        message: 'Bootstrap secret is not configured on the server.',
      });
    }

    if (secret !== bootstrapSecret) {
      return res.status(401).json({ success: false, message: 'Invalid bootstrap secret' });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        adminExists: true,
      });
    }

    const adminData = {
      name: name || process.env.BOOTSTRAP_ADMIN_NAME || 'Admin User',
      email: email || process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@travelhub.com',
      password: password || process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin@2374',
      phone: phone || process.env.BOOTSTRAP_ADMIN_PHONE || '+10000000000',
      role: 'admin',
      isVerified: true,
      isActive: true,
    };

    const admin = await User.create(adminData);

    res.status(201).json({
      success: true,
      message: 'Bootstrap admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendOTPEmail(email, otp, user.name);

    if (!emailResult.success) {
      return res.status(502).json({
        success: false,
        message: 'Unable to send OTP email. Please check SMTP settings.',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Missing idToken' });

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const googleClientIdSource = process.env.GOOGLE_CLIENT_ID ? 'GOOGLE_CLIENT_ID' : process.env.VITE_GOOGLE_CLIENT_ID ? 'VITE_GOOGLE_CLIENT_ID' : 'none';
    console.log(`googleAuth: GOOGLE_CLIENT_ID source=${googleClientIdSource} value=${googleClientId ? '(set)' : '(missing)'}`);
    const isPlaceholder = !googleClientId || /your_google|your_google_client_id|your_google_client_id_here/i.test(googleClientId);
    if (isPlaceholder) {
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured on the server.' });
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    const { sub, email, email_verified, name, picture } = payload || {};

    if (!email || !email_verified) {
      return res.status(400).json({ success: false, message: 'Google account email not verified' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        avatar: picture || '',
        isVerified: true,
        googleId: sub || '',
      });
    } else {
      let changed = false;
      if (!user.googleId && sub) { user.googleId = sub; changed = true; }
      if (!user.avatar && picture) { user.avatar = picture; changed = true; }
      if (!user.isVerified && email_verified) { user.isVerified = true; changed = true; }
      if (changed) await user.save();
    }

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, agencyProfile, partnerProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const allowedRoles = ['customer', 'travel_agency', 'car_rental_partner', 'bus_operator', 'airline_partner', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const userData = {
      name,
      email,
      password,
      phone,
      role: userRole,
      isVerified: true,
    };

    if (userRole === 'travel_agency') {
      userData.agencyProfile = {
        ...(agencyProfile || {}),
        isApproved: false,
      };
    }

    if (['car_rental_partner', 'bus_operator', 'airline_partner'].includes(userRole)) {
      userData.partnerProfile = {
        ...(partnerProfile || {}),
        isApproved: false,
      };
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        isVerified: user.isVerified,
        agencyProfile: user.agencyProfile,
        partnerProfile: user.partnerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'agencyProfile', 'partnerProfile'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const allowed = ['name', 'email', 'phone', 'role', 'agencyProfile', 'partnerProfile', 'isActive', 'isVerified'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(user, updates);

    if (password !== undefined) {
      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    await user.save();

    res.json({ success: true, user: await User.findById(user._id).select('-password') });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, isVerified },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const approvePartner = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'travel_agency') {
      user.agencyProfile.isApproved = true;
    } else {
      user.partnerProfile.isApproved = true;
    }
    await user.save();

    res.json({ success: true, message: 'Partner approved', user });
  } catch (error) {
    next(error);
  }
};
