const jwt = require("jsonwebtoken");
const prisma = require("../db"); // Pastikan path ini benar

const protect = async (req, res, next) => {
  let token;

  // 1. Cek Token dari Cookie ATAU Header Authorization (Bearer)
  if (req.cookies && req.cookies.blindbox_token) {
    token = req.cookies.blindbox_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak, token tidak ditemukan." });
  }

  try {
    // 2. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Ambil data user dari DB
    // CATATAN: Field notificationUpdates & notificationOrders DIHAPUS karena tidak ada di schema baru
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        // notificationUpdates: true, // Field ini TIDAK ADA di schema
        // notificationOrders: true,  // Field ini TIDAK ADA di schema
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    // 4. Lampirkan user ke objek request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kedaluwarsa." });
  }
};

module.exports = { protect };
