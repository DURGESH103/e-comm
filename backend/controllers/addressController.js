const Address = require('../models/Address');

/* ── helpers ── */
const owns = (address, userId) => address.user.toString() === userId.toString();

// POST /api/address
const addAddress = async (req, res) => {
  try {
    const { fullName, phone, houseNumber, street, city, state, pincode, country, latitude, longitude } = req.body;

    if (!fullName || !phone || !houseNumber || !street || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // If this is the user's first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user.id });
    const isDefault = count === 0;

    const address = await Address.create({
      user: req.user.id,
      fullName, phone, houseNumber, street, city, state, pincode,
      country: country || 'India',
      latitude: latitude || null,
      longitude: longitude || null,
      isDefault,
    });

    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/address
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/address/:id
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (!owns(address, req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    const allowed = ['fullName', 'phone', 'houseNumber', 'street', 'city', 'state', 'pincode', 'country', 'latitude', 'longitude'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) address[field] = req.body[field];
    });

    await address.save();
    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/address/:id
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (!owns(address, req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // Promote the most recent remaining address to default
    if (wasDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/address/:id/default
const setDefault = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (!owns(address, req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    // Unset all, then set this one
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addAddress, getAddresses, updateAddress, deleteAddress, setDefault };
