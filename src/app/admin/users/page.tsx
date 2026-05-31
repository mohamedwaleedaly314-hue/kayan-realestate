export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Users, Heart, MessageSquare, Phone, Mail } from 'lucide-react';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, created_at: true,
      _count: { select: { saves: true, leads: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">المستخدمون المسجّلون</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} مستخدم في قاعدة البيانات</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <Users className="w-8 h-8 text-gold mb-2" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <Heart className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{users.reduce((a, u) => a + u._count.saves, 0)}</p>
          <p className="text-sm text-muted-foreground">إجمالي المحفوظات</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{users.reduce((a, u) => a + u._count.leads, 0)}</p>
          <p className="text-sm text-muted-foreground">إجمالي الاستفسارات</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <Phone className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{users.filter((u) => u.phone).length}</p>
          <p className="text-sm text-muted-foreground">لديهم رقم هاتف</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold">البريد</th>
                <th className="text-right px-4 py-3 font-semibold">الهاتف</th>
                <th className="text-right px-4 py-3 font-semibold">المحفوظات</th>
                <th className="text-right px-4 py-3 font-semibold">الاستفسارات</th>
                <th className="text-right px-4 py-3 font-semibold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">لا يوجد مستخدمون مسجّلون بعد</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${u.email}`} className="hover:text-foreground transition-colors">{u.email}</a>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.phone ? (
                      <a href={`https://wa.me/${u.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-green-600 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {u.phone}
                      </a>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="w-3.5 h-3.5 text-red-400" /> {u._count.saves}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> {u._count.leads}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
