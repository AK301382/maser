import { useState, memo } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

function AdminLogin({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      onLogin(response.user, response.access_token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0" data-testid="admin-login-card">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-4 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-l from-slate-700 to-slate-900 bg-clip-text text-transparent">
            پنل مدیریت
          </CardTitle>
          <CardDescription className="text-base">
            ورود به پنل مدیریت مسیر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                data-testid="admin-email-input"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                data-testid="admin-password-input"
                type="password"
                placeholder="رمز عبور را وارد کنید"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              data-testid="admin-login-button"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-l from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                'ورود'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>فقط برای مدیران سیستم</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(AdminLogin);
