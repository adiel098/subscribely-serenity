
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // וודא שהבקשה היא מסוג POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;
  const signature = req.headers['x-nowpayments-sig'] as string;

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature header' });
  }

  try {
    // קבל את הקמפיין הרלוונטי על סמך מזהה ההזמנה
    const orderId = payload.order_id;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Missing order ID' });
    }
    
    // פיצול מזהה ההזמנה לקבלת מזהה הקהילה ומזהה המשתמש
    const [communityId, telegramUserId] = orderId.split('_');
    
    if (!communityId || !telegramUserId) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // קבל את האיי-פי-אן סיקרט המתאים לקהילה זו
    const { data: paymentMethodData, error: paymentMethodError } = await supabase
      .from('payment_methods')
      .select('config')
      .eq('provider', 'nowpayments')
      .eq('community_id', communityId)
      .single();
      
    if (paymentMethodError || !paymentMethodData?.config?.ipn_secret) {
      console.error('Error fetching IPN secret:', paymentMethodError);
      return res.status(500).json({ error: 'Failed to validate webhook' });
    }
    
    // אמת את החתימה על ידי שימוש ב-IPN SECRET
    const ipnSecret = paymentMethodData.config.ipn_secret;
    const calculatedSignature = crypto
      .createHmac('sha512', ipnSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== calculatedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // בדוק את סטטוס התשלום
    const paymentStatus = payload.payment_status;
    
    // רק אם התשלום הושלם או אושר
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      // יצירת הזמנת מנוי חדשה
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          community_id: communityId,
          telegram_user_id: telegramUserId,
          status: 'active',
          payment_provider: 'nowpayments',
          payment_id: payload.payment_id
        });
        
      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return res.status(500).json({ error: 'Failed to create subscription' });
      }
      
      // יצירת לינק הזמנה לקהילה
      const { data: inviteLinkData, error: inviteLinkError } = await supabase.functions.invoke(
        'create-invite-link',
        {
          body: { communityId }
        }
      );
      
      if (inviteLinkError) {
        console.error('Error creating invite link:', inviteLinkError);
        return res.status(500).json({ error: 'Failed to create invite link' });
      }
      
      // עדכון התשלום עם לינק ההזמנה
      const { error: paymentUpdateError } = await supabase
        .from('project_payments')
        .insert({
          community_id: communityId,
          telegram_user_id: telegramUserId,
          payment_method: 'nowpayments',
          status: 'completed',
          amount: payload.price_amount,
          currency: payload.price_currency,
          payment_id: payload.payment_id,
          invite_link: inviteLinkData.inviteLink
        });
        
      if (paymentUpdateError) {
        console.error('Error updating payment record:', paymentUpdateError);
        return res.status(500).json({ error: 'Failed to update payment record' });
      }
    }
    
    // החזר תגובת הצלחה
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
