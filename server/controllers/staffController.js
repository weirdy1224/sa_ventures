const User = require('../models/User');
const { sendStaffCredentials } = require('../services/emailService');
const bcrypt = require('bcryptjs');

// POST /api/staff  (Admin only)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'staff' });
    await sendStaffCredentials({ email, name }, password, 'staff');
    res.status(201).json({ user: user.toPublic() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password -refreshToken').sort('-createdAt');
    res.json({ staff });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/staff/:id  (deactivate)
exports.deactivateStaff = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Staff deactivated', user: user.toPublic() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/delivery-persons  (Admin or Staff)
exports.createDeliveryPerson = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Staff cannot escalate beyond delivery role
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'delivery' });
    await sendStaffCredentials({ email, name }, password, 'delivery');
    res.status(201).json({ user: user.toPublic() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/delivery-persons
exports.getDeliveryPersons = async (req, res) => {
  try {
    const persons = await User.find({ role: 'delivery', isActive: true }).select('name email phone isActive createdAt').sort('name');
    res.json({ persons });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
