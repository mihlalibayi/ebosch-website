import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    
    const paymentStatus = params.get('payment_status');
    const membershipId = params.get('m_payment_id');

    if (!membershipId) {
      return NextResponse.json({ error: 'No membership ID' }, { status: 400 });
    }

    if (paymentStatus === 'COMPLETE') {
      await updateDoc(doc(db, 'monthly_memberships', membershipId), {
        status: 'active',
        lastPaymentDate: new Date().toISOString(),
        nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayFast notify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}