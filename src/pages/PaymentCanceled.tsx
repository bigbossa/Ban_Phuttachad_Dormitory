import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCanceled: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/billing');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <svg className="mx-auto mb-4 text-red-500" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h1 className="text-2xl font-bold mb-2 text-black">Payment Canceled</h1>
        <p className="mb-4 text-black">Your payment was canceled or failed. Redirecting to billing page...</p>
      </div>
    </div>
  );
};

export default PaymentCanceled;
