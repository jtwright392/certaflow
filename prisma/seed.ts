import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

    console.log("🌱 Seeding...")
    const org = await prisma.organization.create({
        data: { name: "CertaFlow Demo Org"}
    })

    const user = await prisma.user.create({
        data: {
            email: "admin@certaflow.dev",
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
            organizationId: org.id
        }
    })

    await prisma.certificateType.create({
        data: {
            name: "CPR Certification",
            renewalCadenceDays: 365,
            organizationId: org.id
        }
    })
    console.log("✅ Seed complete:")

    console.log("Seed Complete")
}

main().catch(console.error).finally(()=> prisma.$disconnect())