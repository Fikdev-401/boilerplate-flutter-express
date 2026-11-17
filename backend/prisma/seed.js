const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Daily Missions...');
    try {
        await prisma.userDailyMission.deleteMany();
        await prisma.dailyMissionTemplate.deleteMany();

        await prisma.dailyMissionTemplate.createMany({
            data: [
                {
                    title: 'Bantu ganti popok hari ini',
                    description: 'Ambil inisiatif ganti popok tanpa diminta.',
                    iconKey: 'baby',
                    xpReward: 50,
                    sortOrder: 1,
                },
                {
                    title: 'Cuci piring setelah makan malam',
                    description: 'Selesaikan sampai bersih agar Ibu bisa istirahat.',
                    iconKey: 'cleaning',
                    xpReward: 40,
                    sortOrder: 2,
                },
                {
                    title: 'Ajak ngobrol 15 menit tanpa distraksi',
                    description: 'Dengar aktif kondisi Ibu hari ini tanpa main HP.',
                    iconKey: 'chat',
                    xpReward: 35,
                    sortOrder: 3,
                },
                {
                    title: 'Ambil alih jaga anak 30 menit',
                    description: 'Kasih ruang untuk Ibu punya waktu jeda.',
                    iconKey: 'watch',
                    xpReward: 45,
                    sortOrder: 4,
                },
                {
                    title: 'Berikan apresiasi tulus hari ini',
                    description: 'Sampaikan satu pujian spesifik untuk usaha Ibu.',
                    iconKey: 'heart',
                    xpReward: 30,
                    sortOrder: 5,
                },
            ],
        });
    } catch (error) {
        if (error.code === 'P2021') {
            console.log('Skip daily mission seed: tabel belum dimigrasi.');
        } else {
            throw error;
        }
    }

    console.log('Seeding Learning Modules...');

    // Reset learning data to avoid duplicates
    await prisma.userModuleProgress.deleteMany();
    await prisma.learningModule.deleteMany();

    const modules = [
        {
            title: 'Menjadi Ayah Siaga',
            content: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
            type: 'VIDEO',
            orderIndex: 1,
        },
        {
            title: 'Komunikasi dengan Pasangan',
            content: 'Komunikasi efektif dimulai dari mendengar aktif. Saat pasangan bercerita, hindari menyela dan fokus memahami emosi di balik kata-kata. Gunakan kalimat validasi sebelum memberi solusi. Sisihkan waktu 10 menit tiap malam untuk check-in tentang kondisi, kebutuhan, dan rencana esok hari.',
            type: 'ARTICLE',
            orderIndex: 2,
        },
        {
            title: 'Rutinitas Pagi Ayah Produktif',
            content: 'Bangun 30 menit lebih awal untuk menyiapkan hal kecil di rumah: perlengkapan anak, botol minum, atau bekal sederhana. Beban mental pasangan berkurang saat pagi lebih terstruktur. Gunakan checklist pendek agar kebiasaan ini konsisten dilakukan.',
            type: 'ARTICLE',
            orderIndex: 3,
        },
        {
            title: 'Teknik Menenangkan Bayi Rewel',
            content: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
            type: 'VIDEO',
            orderIndex: 4,
        },
        {
            title: 'Manajemen Emosi Ayah',
            content: 'Ketika emosi naik, lakukan jeda 90 detik sebelum merespons. Atur napas 4-4-6 dan hindari kalimat defensif. Mengenali pemicu pribadi membantu kamu merespons dengan kepala dingin. Tujuan utamanya bukan menekan emosi, tapi mengelolanya agar tidak melukai hubungan.',
            type: 'ARTICLE',
            orderIndex: 5,
        },
        {
            title: 'Basic P3K Anak di Rumah',
            content: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            type: 'VIDEO',
            orderIndex: 6,
        },
        {
            title: 'Financial Planning Keluarga Muda',
            content: 'Mulai dari dana darurat 3-6 bulan pengeluaran. Pisahkan anggaran kebutuhan pokok, pendidikan anak, dan tabungan tujuan jangka panjang. Review pengeluaran mingguan bareng pasangan agar keputusan finansial lebih transparan dan minim konflik.',
            type: 'ARTICLE',
            orderIndex: 7,
        },
        {
            title: 'Co-Parenting yang Seimbang',
            content: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            type: 'VIDEO',
            orderIndex: 8,
        },
        {
            title: 'Disiplin Positif untuk Balita',
            content: 'Disiplin positif mengajarkan batasan dengan empati. Jelaskan aturan secara singkat, konsisten, dan tanpa ancaman berlebihan. Fokus pada perilaku yang ingin dibentuk, bukan hukuman semata. Dengan cara ini, anak belajar tanggung jawab dan rasa aman secara bersamaan.',
            type: 'ARTICLE',
            orderIndex: 9,
        },
        {
            title: 'Quality Time 15 Menit Setiap Hari',
            content: 'Quality time tidak harus lama. Luangkan 15 menit tanpa gadget untuk ngobrol atau bermain dengan anak. Konsistensi waktu kecil setiap hari lebih berdampak daripada rencana besar yang jarang dilakukan. Aktivitas sederhana yang penuh perhatian membangun ikatan kuat.',
            type: 'ARTICLE',
            orderIndex: 10,
        },
    ];

    await prisma.learningModule.createMany({ data: modules });

    console.log('Seeding Forum Posts...');

    const plainPassword = 'password123';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const dummyUser = await prisma.user.upsert({
        where: { email: 'ayah.demo@ruangayah.local' },
        update: {
            name: 'Ayah Demo',
            passwordHash,
            isVerified: true,
            role: 'AYAH',
            status: 'ACTIVE',
        },
        create: {
            name: 'Ayah Demo',
            email: 'ayah.demo@ruangayah.local',
            passwordHash,
            isVerified: true,
            role: 'AYAH',
            status: 'ACTIVE',
        },
    });
    console.log('User dummy siap: ayah.demo@ruangayah.local / password123');

    let user = await prisma.user.findFirst();
    user = user ?? dummyUser;

    if (user) {
        // reset forum dummy data
        await prisma.forumVote.deleteMany();
        await prisma.forumComment.deleteMany();
        await prisma.forumPost.deleteMany();

        const posts = [
            {
                title: 'Susah bangun tengah malam, ada tips?',
                content: 'Halo para ayah, saya sering susah bangun pas bayi nangis. Ada tips biar bisa lebih sigap?',
                authorId: user.id,
                upvotes: 5,
                downvotes: 0,
            },
            {
                title: 'Rekomendasi Stroller Murah tapi Bagus',
                content: 'Lagi cari stroller budget 1-2 juta, merk apa ya yang awet?',
                authorId: user.id,
                upvotes: 12,
                downvotes: 1,
            },
            {
                title: 'Curhat: Kerjaan numpuk tapi pengen main sama anak',
                content: 'Gimana cara bagi waktunya ya? Rasanya 24 jam kurang.',
                authorId: user.id,
                isAnonymous: true,
                upvotes: 25,
                downvotes: 2,
            },
        ];

        await prisma.forumPost.createMany({ data: posts });
    } else {
        console.log('Tidak ada user ditemukan, skip seeding ForumPost. Silakan register user dulu.');
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
