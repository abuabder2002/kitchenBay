import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function getDbUser() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const email = authUser.email;
  if (!email) return null;

  const name = authUser.user_metadata?.full_name || email.split('@')[0];

  // Map to clerkUserId since it's the current unique key in the DB.
  let user = await prisma.user.findUnique({ where: { clerkUserId: authUser.id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { clerkUserId: authUser.id, name }
      });
    } else {
      user = await prisma.user.create({
        data: { clerkUserId: authUser.id, email, name }
      });
    }
  }
  return user;
}
