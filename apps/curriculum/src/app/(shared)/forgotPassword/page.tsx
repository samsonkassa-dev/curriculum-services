'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useForgotPassword } from '@/lib/hooks/useForgotPassword';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  
  const { requestOtp, resetPassword } = useForgotPassword();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    requestOtp.mutate(email, {
      onSuccess: () => setStep(2),
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    resetPassword.mutate({
      email,
      otp,
      newPassword
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-white p-4 lg:w-1/2">
        <div className="w-full max-w-[368px] flex flex-col items-center gap-10">
          {step === 1 ? (
            <>
              <div className="w-full text-center space-y-2">
                <h1 className="text-[24px] font-semibold text-[#292827] font-inter">
                  Forgot Password?
                </h1>
                <p className="text-[14px] text-[#9C9791] font-inter">
                  Enter your registered email address below and we&apos;ll send you an OTP to reset your password.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="w-full space-y-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={requestOtp.isPending}
                  className="w-full bg-[#0B75FF] text-white py-[10px] px-7 rounded-[5px] font-inter font-medium text-[16px] tracking-[1.25%] hover:bg-[#0B75FF]/90 transition-colors"
                >
                  {requestOtp.isPending ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-full text-center space-y-2">
                <h1 className="text-[24px] font-semibold text-[#292827] font-inter">
                  Reset Password
                </h1>
                <p className="text-[14px] text-[#9C9791] font-inter">
                  Enter the OTP sent to your email and create a new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="w-full space-y-6">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label 
                    htmlFor="otp" 
                    className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
                  >
                    OTP Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                    placeholder="Enter OTP code"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="newPassword" 
                    className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                    <button 
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
                  >
                    Confirm Password
                  </label>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetPassword.isPending}
                  className="w-full bg-[#0B75FF] text-white py-[10px] px-7 rounded-[5px] font-inter font-medium text-[16px] tracking-[1.25%] hover:bg-[#0B75FF]/90 transition-colors"
                >
                  {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[#0B75FF] bg-white border border-[#0B75FF] py-[10px] px-7 rounded-[5px] font-inter font-medium text-[16px] tracking-[1.25%] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </form>
            </>
          )}

          <Link 
            href="/login" 
            className="flex items-center gap-1 text-[14px] text-[#0B75FF] font-inter hover:underline pt-[38px]"
          >
            <ArrowLeft size={16} />
            Return to login
          </Link>
        </div>
      </div>
      
      <div className="hidden w-1/2 bg-brand lg:block" />
    </div>
  );
}