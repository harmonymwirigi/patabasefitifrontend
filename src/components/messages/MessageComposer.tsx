// File: frontend/src/components/messages/MessageComposer.tsx
// Status: COMPLETE
// Dependencies: react, formik, yup, api/messages

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sendMessage } from '../../api/messages';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';

interface MessageComposerProps {
  receiverId: number;
  propertyId?: number;
  conversationId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  receiverId,
  propertyId,
  conversationId,
  onSuccess,
  onCancel,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation schema
  const MessageSchema = Yup.object().shape({
    message: Yup.string()
      .min(2, 'Message is too short')
      .max(1000, 'Message is too long')
      .required('Message is required'),
  });

  const handleSubmit = async (values: { message: string }, { resetForm }: any) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await sendMessage(token, {
        receiver_id: receiverId,
        property_id: propertyId,
        conversation_id: conversationId,
        content: values.message,
      });
      
      setSuccess('Message sent successfully!');
      resetForm();
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      
      if (err.response && err.response.status === 402) {
        setError('You need tokens to contact property owners. Please purchase tokens to continue.');
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <Formik
        initialValues={{ message: '' }}
        validationSchema={MessageSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <Field
                as="textarea"
                id="message"
                name="message"
                rows={4}
                placeholder="Write your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="message" component="div" className="mt-1 text-sm text-red-600" />
              <p className="mt-1 text-xs text-gray-500">
                This will cost 2 tokens from your balance.
              </p>
            </div>
            
            <div className="flex space-x-3 justify-end">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MessageComposer;