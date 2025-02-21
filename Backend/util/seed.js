const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    await prisma.user.deleteMany();
    await prisma.camp.deleteMany();
    await prisma.workshop.deleteMany();

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@admin.admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
        },
    });

    const teacher = await prisma.user.create({
        data: {
            username: 'teacher',
            email: 'teacher@teacher.teacher',
            password: await bcrypt.hash('teacher123', 10),
            role: 'TEACHER',
        },
    });

    const camp = await prisma.camp.create({
        data: {
            name: 'Kamp 1',
            startDate: new Date('2025-01-01T00:00:00Z'),
            endDate: new Date('2025-01-07T00:00:00Z'),
            address: 'Kampstraat 1',
            startTime: '10:00',
            endTime: '16:00',
            minAge: 6,
            maxAge: 12,
            picture: 'https://via.placeholder.com/150',
            archived: false,
        },
    });

    const workshop = await prisma.workshop.create({
        data: {
            name: 'Workshop 1',
            markdown: 'Workshop 1 markdown',
        },
    });

    const group1 = await prisma.group.create({
        data: {
            name: 'Groep 1',
        },
    });

    const group2 = await prisma.group.create({
        data: {
            name: 'Groep 2',
        },
    });
}

(async () => {
    try {
        await main();
        await prisma.$disconnect();
    } catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
})();