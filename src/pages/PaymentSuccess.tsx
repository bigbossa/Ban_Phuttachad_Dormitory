import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updateBillingStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const billingId = urlParams.get('billing_id');
      if (billingId) {
        await supabase
          .from('billing')
          .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
          .eq('id', billingId);
      }
      setTimeout(() => {
        navigate('/billing');
      }, 2000);
    };
    updateBillingStatus();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <svg className="mx-auto mb-4 text-green-500" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="text-2xl font-bold mb-2 text-black">Payment Successful!</h1>
        <p className="mb-4 text-black">Thank you for your payment. Redirecting to billing page...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
