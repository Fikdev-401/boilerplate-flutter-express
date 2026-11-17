const prisma = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.thenatapals.web.id",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.trim() : "",
    pass: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim() : "",
  },
  tls: {
    rejectUnauthorized: false
  }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  static sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Verifikasi Email - Ruang Ayah",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h1 style="color: #1a1a1a; text-align: center;">Ruang Ayah</h1>
            <p style="text-align: center; color: #666666;">Komunitas Ayah Hebat</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 16px; color: #333;">Silakan verifikasi akun Anda dengan menekan tombol di bawah:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verifikasi Sekarang</a>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Ruang Ayah.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  };

  static generateToken = (user) => {
    return jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" } // Untuk mobile, biasanya token dibuat lebih lama (misal 30 hari) biar user ga sering re-login
    );
  };

  static login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Kredensial tidak valid.");

    if (!user.passwordHash && user.googleId) {
      throw new Error("GOOGLE_LOGIN_REQUIRED");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new Error("Kredensial tidak valid.");

    if (!user.isVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    const token = this.generateToken(user);
    const { passwordHash, ...userData } = user;

    return { token, userData };
  };

  // backend/Controller/AuthController.js
static register = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword, 
        isVerified: true, 
        verificationToken: null,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error didalam Prisma Create User:", error);
    throw error;
  }
};

  static verifyEmail = async (token) => {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new Error("Token verifikasi tidak valid.");

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });
  };

  static googleLogin = async (idToken) => {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, avatarUrl: picture, isVerified: true }
        });
      }
    } else {
      user = await prisma.user.create({
        data: { name, email, googleId, avatarUrl: picture, passwordHash: "", isVerified: true }
      });
    }

    const token = this.generateToken(user);
    const { passwordHash, ...userData } = user;
    return { token, userData };
  };

  static getProfile = async (userId) => {
    const totalSpentAggregate = await prisma.order.aggregate({
      where: { userId, paymentStatus: 'COMPLETED' },
      _sum: { totalAmount: true }
    });

    const totalSpent = totalSpentAggregate._sum.totalAmount || 0;
    const userDB = await prisma.user.findUnique({ where: { id: userId } });
    if (!userDB) throw new Error("Pengguna tidak ditemukan.");

    const userData = { ...userDB, totalSpent: Number(totalSpent) };
    delete userData.passwordHash;

    return userData;
  };

  static updateProfile = async (userId, updateData) => {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true,
        notificationUpdates: true, notificationOrders: true,
        createdAt: true, avatarUrl: true, isVerified: true,
      },
    });
  };

  static updatePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Pengguna tidak ditemukan.");

    if (!user.passwordHash) {
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
      return { message: "Password berhasil dibuat." };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) throw new Error("Password lama salah.");

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: "Kata sandi berhasil diubah." };
  };

  static getAllUsers = async () => {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true, isVerified: true, googleId: true },
      orderBy: { createdAt: "asc" },
    });
  };

  static updateRole = async (userId, newRole) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole.toUpperCase() },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
  };
}

module.exports = AuthService;