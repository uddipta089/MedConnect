import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { User, Camera, Key } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfileData(res.data.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);
    
    const toastId = toast.loading('Uploading image...');
    try {
      // The backend route depends on role. Let's use doctor for now or just generic if implemented.
      // We will assume a generic route or use the specific one based on role.
      const endpoint = user.role === 'Doctor' ? '/doctors/upload-profile' : '/patients/upload-profile';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData({ ...profileData, profileImage: res.data.data.url });
      toast.success('Profile picture updated!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return toast.error('Fill both password fields');
    
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: oldPassword, newPassword });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image & Basic Info */}
        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            {profileData?.profileImage ? (
              <img src={profileData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="h-12 w-12 text-slate-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-sm">
              <Camera className="h-4 w-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{user?.role}</span>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-slate-500" /> Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <Input 
                label="Current Password" 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                required 
              />
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength="6"
              />
              <Button type="submit" isLoading={passwordLoading}>Update Password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
