import OrderTrackingClient from './OrderTrackingClient';

interface OrderTrackingPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderTrackingPage({ params, searchParams }: OrderTrackingPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const orderId = resolvedParams.orderId;
  const contactParam = resolvedSearchParams.contact;
  const contact = Array.isArray(contactParam) ? contactParam[0] : contactParam || '';

  return <OrderTrackingClient orderId={orderId} contact={contact} />;
}
