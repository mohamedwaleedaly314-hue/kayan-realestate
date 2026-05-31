import { redirect } from 'next/navigation';
import { verifyUserSession } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from '@/components/profile/profile-client';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await verifyUserSession();
  if (!session) redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, email: true, phone: true, created_at: true,
      _count: { select: { saves: true, leads: true } },
    },
  });

  if (!user) redirect('/auth/signin');

  const [savedProperties, myLeads, myListings] = await Promise.all([
    prisma.savedProperty.findMany({
      where: { user_id: session.userId },
      orderBy: { created_at: 'desc' },
      include: {
        property: {
          include: { images: { where: { is_primary: true }, take: 1 } },
        },
      },
    }),

    prisma.lead.findMany({
      where: { user_id: session.userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { property: { select: { title_ar: true, slug: true } } },
    }),

    // Properties submitted by this user (via free listing form)
    prisma.property.findMany({
      where: {
        owner: { user_id: session.userId },
      },
      orderBy: { created_at: 'desc' },
      include: {
        images: { where: { is_primary: true }, take: 1 },
      },
    }),
  ]);

  return (
    <ProfileClient
      user={{ ...user, created_at: user.created_at.toISOString() }}
      savedProperties={savedProperties.map((s) => ({
        id: s.id,
        property: {
          ...s.property,
          price: Number(s.property.price),
          images: s.property.images,
        },
      }))}
      myLeads={myLeads}
      myListings={myListings.map((p) => ({
        ...p,
        price: Number(p.price),
        created_at: p.created_at.toISOString(),
        free_listing_until: p.free_listing_until?.toISOString() ?? null,
        images: p.images,
      }))}
    />
  );
}
