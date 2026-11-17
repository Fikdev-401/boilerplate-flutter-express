const adminProtect = (req, res, next) => {
    // Memastikan req.user sudah terisi oleh middleware 'protect'
    if (req.user && req.user.role === 'ADMIN') {
        // Jika role adalah ADMIN, lanjutkan ke controller
        next(); 
    } else {
        // Jika role adalah CUSTOMER atau tidak ada (meskipun seharusnya dicegah oleh 'protect')
        return res.status(403).json({ 
            message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses sumber daya ini.' 
        });
    }
};

module.exports = { adminProtect }