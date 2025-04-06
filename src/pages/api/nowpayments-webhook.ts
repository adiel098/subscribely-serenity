import { NextApiRequest, NextApiResponse } from 'next';
import { PaymentService } from '@/services/payment.service';
import { PaymentStatus } from '@/models/payment.model';
import { supabase } from '@/integrations/supabase/client';

// סטטוסים אפשריים מ-NOWPayments
const STATUS_MAP: Record<string, PaymentStatus> = {
  'finished': 'completed',
  'confirmed': 'completed',
  'waiting': 'pending',
  'confirming': 'processing',
  'failed': 'failed',
  'expired': 'expired',
  'refunded': 'refunded',
  'cancelled': 'failed'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      payment_id,
      payment_status,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      order_id
    } = req.body;

    // לוג של הווובהוק שהתקבל
    console.log('Received NOWPayments webhook:', {
      payment_id,
      payment_status,
      order_id
    });

    const paymentService = new PaymentService();
    const payment = await paymentService.getPaymentByExternalId(payment_id);

    if (!payment) {
      console.error('Payment not found:', payment_id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // עדכון סטטוס התשלום
    const newStatus = STATUS_MAP[payment_status] || 'pending';
    await paymentService.updatePaymentStatus(payment.id, newStatus);

    // אם התשלום הושלם, נעדכן את המנוי
    if (newStatus === 'completed') {
      const { error: subError } = await supabase
        .from('community_subscribers')
        .update({
          subscription_status: 'active',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', payment.id);

      if (subError) {
        console.error('Error updating subscription:', subError);
        return res.status(500).json({ error: 'Failed to update subscription' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
