import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Profile</h1>
        <p className="text-zinc-400 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
            <User className="h-10 w-10 text-zinc-500" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-zinc-400 flex items-center justify-center sm:justify-start mt-1">
              <Mail className="h-4 w-4 mr-2" />
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">Account Created</p>
              <p className="text-zinc-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">Account Type</p>
              <p className="text-zinc-300 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                Standard User
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-zinc-900/30 border-t border-zinc-800">
          <h3 className="text-lg font-medium text-white mb-4">Security</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Password change and other security features are available in account settings.
          </p>
          <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800">
            Change Password (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
