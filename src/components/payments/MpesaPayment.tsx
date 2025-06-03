// File: frontend/src/components/payments/MpesaPayment.tsx
// M-Pesa payment component for token purchases

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle, XCircle, Phone, CreditCard, Timer } from 'lucide-react';
import { initiateMpesaPayment, checkMpesaStatus } from '../../api/payments';

interface TokenPackage {
  id: number;
  name: string;
  token_count: number;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

interface MpesaPaymentProps {
  tokenPackage: TokenPackage;
  onSuccess: (transactionId: number, tokensAdded: number) => void;
  onCancel: () => void;
}

type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'completed' | 'failed' | 'cancelled' | 'timeout';

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  tokenPackage,
  onSuccess,
  onCancel
}) => {
  const { token } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length and starting digits
    if (cleaned.startsWith('254')) {
      return cleaned.slice(0, 12);
    } else if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
      return cleaned.slice(0, 10);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return cleaned.slice(0, 9);
    }
    return cleaned.slice(0, 10);
  };

  // Validate phone number
  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('254') && cleaned.length === 12) return true;
    if ((cleaned.startsWith('07') || cleaned.startsWith('01')) && cleaned.length === 10) return true;
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) return true;
    
    return false;
  };

  // Start payment process
  const initiatePayment = async () => {
    if (!token || !isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setStatus('initiating');
    setError(null);

    try {
      const response = await initiateMpesaPayment(token, {
        package_id: tokenPackage.id,
        phone_number: phoneNumber,
        amount: tokenPackage.price
      });

      if (response.success) {
        setStatus('pending');
        setCheckoutRequestId(response.checkout_request_id);
        setTransactionId(response.transaction_id);
        setStatusMessage('Please check your phone and enter your M-Pesa PIN');
        setCountdown(120); // 2 minutes timeout
        
        // Start checking payment status
        startStatusPolling(response.checkout_request_id);
      } else {
        setStatus('failed');
        setError(response.error || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setStatus('failed');
      setError(err.response?.data?.detail || 'Network error. Please try again.');
    }
  };

  // Poll payment status
  const startStatusPolling = (checkoutId: string) => {
    const pollInterval = setInterval(async () => {
      if (!token) return;

      try {
        const statusResponse = await checkMpesaStatus(token, checkoutId);
        
        if (statusResponse.success) {
          switch (statusResponse.status) {
            case 'completed':
              setStatus('completed');
              setStatusMessage('Payment completed successfully!');
              clearInterval(pollInterval);
              
              // Call success callback
              if (transactionId) {
                onSuccess(transactionId, tokenPackage.token_count);
              }
              break;
              
            case 'failed':
              setStatus('failed');
              setStatusMessage(statusResponse.message || 'Payment failed');
              setError(statusResponse.message || 'Payment failed');
              clearInterval(pollInterval);
              break;
              
            case 'cancelled':
              setStatus('cancelled');
              setStatusMessage('Payment was cancelled');
              clearInterval(pollInterval);
              break;
              
            case 'timeout':
              setStatus('timeout');
              setStatusMessage('Payment timed out');
              clearInterval(pollInterval);
              break;
              
            default:
              // Still pending, continue polling
              break;
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (status === 'pending') {
        setStatus('timeout');
        setStatusMessage('Payment verification timed out');
      }
    }, 120000);
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0 && status === 'pending') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  // Reset form
  const resetForm = () => {
    setStatus('idle');
    setError(null);
    setCheckoutRequestId(null);
    setTransactionId(null);
    setCountdown(0);
    setStatusMessage('');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initiating':
      case 'pending':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
      case 'cancelled':
      case 'timeout':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'failed':
      case 'cancelled':
      case 'timeout':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${getStatusColor()}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getStatusIcon()}
        </div>
        <CardTitle>M-Pesa Payment</CardTitle>
        <CardDescription>
          {tokenPackage.name} - {tokenPackage.token_count} tokens
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Package Details */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold text-green-600">
              KES {tokenPackage.price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Tokens:</span>
            <span className="font-semibold">{tokenPackage.token_count}</span>
          </div>
        </div>

        {/* Phone Number Input */}
        {status === 'idle' && (
          <div className="space-y-2">
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="07XXXXXXXX or 254XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                className="pl-10"
                maxLength={12}
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter your Safaricom M-Pesa number
            </p>
          </div>
        )}

        {/* Status Messages */}
        {statusMessage && (
          <Alert>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {/* Countdown Timer */}
        {status === 'pending' && countdown > 0 && (
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
            <Timer className="h-4 w-4" />
            <span>Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {status === 'idle' && (
            <>
              <Button
                onClick={initiatePayment}
                disabled={!isValidPhoneNumber(phoneNumber)}
                className="w-full"
              >
                Pay with M-Pesa
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}

          {status === 'pending' && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel Payment
            </Button>
          )}

          {(status === 'completed') && (
            <Button
              onClick={() => onSuccess(transactionId!, tokenPackage.token_count)}
              className="w-full"
            >
              Continue
            </Button>
          )}

          {(status === 'failed' || status === 'cancelled' || status === 'timeout') && (
            <div className="space-y-2">
              <Button
                onClick={resetForm}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {status === 'pending' && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Check your phone for M-Pesa prompt</p>
            <p>• Enter your M-Pesa PIN</p>
            <p>• Wait for confirmation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;