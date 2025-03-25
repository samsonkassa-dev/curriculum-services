'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useChangePassword } from '@/lib/hooks/useForgotPassword';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  
  const { changePassword } = useChangePassword();

  const toggleOldPasswordVisibility = () => {
    setOldPasswordVisible(!oldPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    changePassword.mutate({
      oldPassword,
      newPassword
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[368px] flex flex-col items-center gap-10">
        <div className="w-full text-center space-y-2">
          <h1 className="text-[24px] font-semibold text-[#292827] font-inter">
            Change Password
          </h1>
          <p className="text-[14px] text-[#9C9791] font-inter">
            Enter your current password and a new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label 
              htmlFor="oldPassword" 
              className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={oldPasswordVisible ? "text" : "password"}
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                placeholder="Enter current password"
                required
              />
              <button 
                type="button"
                onClick={toggleOldPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {oldPasswordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
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
                type={newPasswordVisible ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                placeholder="Enter new password"
                required
              />
              <button 
                type="button"
                onClick={toggleNewPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {newPasswordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="block text-[16px] font-semibold text-[#292827] font-noto-sans"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 border border-[#CCCCCC] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0B75FF] focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
              <button 
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {confirmPasswordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="w-full bg-[#0B75FF] text-white py-[10px] px-7 rounded-[5px] font-inter font-medium text-[16px] tracking-[1.25%] hover:bg-[#0B75FF]/90 transition-colors"
          >
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>

        <Link 
          href="/dashboard" 
          className="flex items-center gap-1 text-[14px] text-[#0B75FF] font-inter hover:underline pt-[38px]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 