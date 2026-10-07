const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = (user) => {
 return jwt.sign({
   id: user._id,
   role: user.role
 }, process.env.JWT_SECRET, {
   expiresIn: process.env.JWT_EXPIRE || '30d'
 });
};
// [POST] /api/auth/register - Đăng ký tài khoản
exports.register = async (req, res) => {
 try {
 const { name, email, password, phone } = req.body;
 if (!name || !email || !password) {
 return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên,email và mật khẩu!' });
 }
 const existing = await User.findOne({ email });
 if (existing) {
 return res.status(400).json({ success: false, message: 'Email này đã được đăng ký tàikhoản!' });
 }
 const user = await User.create({ name, email, password, phone, role: 'customer' });
 const token = generateToken(user);
 res.status(201).json({
 success: true,
 message: 'Đăng ký tài khoản thành công',
 token,
 user: { _id: user._id, name: user.name, email: user.email, role: user.role }
 });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};
// [POST] /api/auth/login - Đăng nhập nhận Token
exports.login = async (req, res) => {
 try {
 const { email, password } = req.body;
 if (!email || !password) {
 return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mậtkhẩu!' });
 }
 const user = await User.findOne({ email });
 if (!user) {
 return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu khôngchính xác!' });
 }
 if (!(await user.matchPassword(password))) {
 return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu khôngchính xác!' });
 }
 if (!user.isActive) {
 return res.status(403).json({ success: false, message: 'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên.' });
 }
 const token = generateToken(user);
 res.status(200).json({
 success: true,
 message: 'Đăng nhập thành công',
 token,
 user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
 });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};
// [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại
exports.getMe = async (req, res) => {
 res.status(200).json({
 success: true,
 message: 'Lấy thông tin tài khoản thành công',
 data: req.user
 });
};

// [POST] /api/auth/users - Tạo người dùng mới (Admin Only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu!'
      });
    }

    if (!['customer', 'admin'].includes(role || 'customer')) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ. Chỉ chấp nhận customer hoặc admin.'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký tài khoản!'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng mới thành công',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/auth/users - Lấy danh sách người dùng (Admin Only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PATCH] /api/auth/users/:id/status - Khóa/Mở khóa người dùng (Admin Only)
exports.toggleUserStatus = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể khóa hoặc mở khóa tài khoản chính của mình.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng cần thay đổi trạng thái!'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive ? 'Đã mở khóa tài khoản thành công' : 'Đã khóa tài khoản thành công',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] /api/auth/users/:id - Xóa người dùng (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể xóa tài khoản chính của mình.'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để xóa!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/auth/users/:id/role - Cập nhật vai trò người dùng (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ. Chỉ chấp nhận customer hoặc admin.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để cập nhật!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò người dùng thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
