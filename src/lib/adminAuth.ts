import { auth, clerkClient } from '@clerk/nextjs/server';

export async function isAdminUser() {
  try {
    const session = await auth();
    if (!session.userId) return false;
    
    const client = await clerkClient();
    const user = await client.users.getUser(session.userId);
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
    
    const adminEmailConfig = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
    const adminEmails = adminEmailConfig.split(',').map(e => e.trim().toLowerCase()).filter(e => e);
    
    return email && adminEmails.includes(email.toLowerCase());
  } catch (error) {
    console.error("Error in isAdminUser check:", error);
    return false;
  }
}
