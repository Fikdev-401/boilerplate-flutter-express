const AuthService = require("../services/AuthService");

class AuthController {
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ status: false, message: "Email dan password wajib diisi." });

      const { token, userData } = await AuthService.login(email, password);

      // Token langsung dilempar ke body JSON untuk ditangkap Flutter
      return res.status(200).json({ 
        status: true,
        message: "Login berhasil!", 
        token, 
        data: userData 
      });
    } catch (error) {
      if (error.message === "GOOGLE_LOGIN_REQUIRED") {
        return res.status(400).json({ status: false, message: "Silakan login menggunakan Google." });
      }
      if (error.message === "EMAIL_NOT_VERIFIED") {
        return res.status(403).json({ status: false, message: "Email belum diverifikasi. Silakan cek email Anda.", needsVerification: true });
      }
      if (error.message === "Kredensial tidak valid.") {
        return res.status(401).json({ status: false, message: error.message });
      }
      return res.status(500).json({ status: false, message: "Terjadi kesalahan pada server saat login.", error: error.message });
    }
  };

  static register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ status: false, message: "Nama, email, dan password wajib diisi." });
      if (password.length < 6) return res.status(400).json({ status: false, message: "Password minimal 6 karakter." });

      const newUser = await AuthService.register(name, email, password);

      // 💡 GENERATE TOKEN LANGSUNG SETELAH REGISTER SUKSES
      const token = AuthService.generateToken(newUser);
      const { password: _, ...userData } = newUser; // bersihkan password dari objek

      return res.status(201).json({
        status: true,
        message: "Pendaftaran berhasil dan otomatis login!",
        token, // <-- Sekarang token dikirim, Flutter ga akan komplain lagi!
        data: userData
      });
    } catch (error) {
      if (error.code === "P2002") return res.status(409).json({ status: false, message: "Email sudah terdaftar." });
      console.error("Duh, error di backend:", error);
      return res.status(500).json({ status: false, message: "Terjadi kesalahan pada server saat pendaftaran.", error: error.message });
    }
  };

  static verifyEmail = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ status: false, message: "Token verifikasi diperlukan." });

      await AuthService.verifyEmail(token);
      return res.status(200).json({ status: true, message: "Email berhasil diverifikasi! Silakan login." });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  };

  static googleLogin = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ status: false, message: "Token Google diperlukan." });

      const { token: jwtToken, userData } = await AuthService.googleLogin(token);

      return res.status(200).json({ 
        status: true,
        message: "Login Google berhasil!", 
        token: jwtToken, 
        data: userData 
      });
    } catch (error) {
      return res.status(401).json({ status: false, message: "Token Google tidak valid.", error: error.message });
    }
  };

  static getProfile = async (req, res) => {
    try {
      const userData = await AuthService.getProfile(req.user.id);
      return res.status(200).json({ status: true, message: "Data profil berhasil diambil.", data: userData });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Gagal mengambil data profil.", error: error.message });
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      let { name, phone, notificationUpdates, notificationOrders } = req.body;

      if (!name) return res.status(400).json({ status: false, message: "Nama wajib diisi." });

      if (typeof notificationUpdates === 'string') notificationUpdates = notificationUpdates === 'true';
      if (typeof notificationOrders === 'string') notificationOrders = notificationOrders === 'true';

      const updateData = {
        name,
        phone,
        notificationUpdates: notificationUpdates !== undefined ? notificationUpdates : req.user.notificationUpdates,
        notificationOrders: notificationOrders !== undefined ? notificationOrders : req.user.notificationOrders,
      };

      if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        updateData.avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      }

      const updatedUser = await AuthService.updateProfile(userId, updateData);
      return res.status(200).json({ status: true, message: "Profil berhasil diperbarui.", data: updatedUser });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Gagal memperbarui profil.", error: error.message });
    }
  };

  static updatePassword = async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ status: false, message: "Password baru minimal 6 karakter." });
      }

      const result = await AuthService.updatePassword(userId, currentPassword, newPassword);
      return res.status(200).json({ status: true, ...result });
    } catch (error) {
      if (error.message === "Password lama salah.") return res.status(401).json({ status: false, message: error.message });
      return res.status(500).json({ status: false, message: "Gagal mengubah kata sandi.", error: error.message });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const users = await AuthService.getAllUsers();
      return res.status(200).json({ status: true, message: "Daftar semua pengguna berhasil diambil.", data: users });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Gagal mengambil daftar pengguna.", error: error.message });
    }
  };

  static updateRole = async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newRole } = req.body;

      const validRoles = ["CUSTOMER", "ADMIN", "MODERATOR"];
      if (!newRole || !validRoles.includes(newRole.toUpperCase())) {
        return res.status(400).json({ status: false, message: `Role tidak valid.` });
      }

      const updatedUser = await AuthService.updateRole(userId, newRole);
      return res.status(200).json({ status: true, message: `Peran pengguna berhasil diubah.`, data: updatedUser });
    } catch (error) {
      if (error.code === "P2025") return res.status(404).json({ status: false, message: "Pengguna tidak ditemukan." });
      return res.status(500).json({ status: false, message: "Gagal mengubah peran pengguna.", error: error.message });
    }
  };

  static logout = async (req, res) => {
    // Di sisi Mobile API, logout cukup dilakukan dengan menghapus token dari Secure Storage di Flutter.
    // Endpoint ini disisakan jika nanti kamu butuh hit ke server untuk blacklisting token (opsional).
    return res.status(200).json({ status: true, message: "Silakan hapus token dari storage lokal perangkat." });
  };
}

module.exports = AuthController;