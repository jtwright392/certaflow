import {cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getTenantContext() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("dev_user_id")?.value

    if (!userId) {
        throw new Error("Not Authenticated  (missing dev_user_id)")
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, organizationId: true, role: true},
    })

    if (!user) {
        throw new Error("Not Authenticated  (invalid dev_user_id)")
    }

    return { userId: user.id, organizationId: user.organizationId, role: user.role };
}