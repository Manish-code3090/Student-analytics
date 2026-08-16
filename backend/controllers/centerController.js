import Center from "../models/centerModel.js";
import Membership from "../models/membershipModel.js";

// POST /api/centers  (create a new center + make creator its admin)
export const createCenter = async (req, res) => {
  try {
    const { name, code, address } = req.body;
    const center = await Center.create({ name, code, address, createdBy: req.user.id });

    await Membership.create({
      user: req.user.id,
      phone: req.user.phone,
      center: center._id,
      role: "admin",
    });

    res.status(201).json({
      center, 
      status: "pending",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/centers/:id
export const getCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) return res.status(404).json({ message: "Center not found" });
    res.json(center);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
