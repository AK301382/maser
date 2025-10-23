import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

function AuthPage() {
  const { setUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = isLogin
        ? await authAPI.login(payload)
        : await authAPI.register(payload);
      localStorage.setItem('token', response.access_token);
      setUser(response.user);
      toast.success(isLogin ? 'خوش آمدید!' : 'ثبت‌نام با موفقیت انجام شد!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در احراز هویت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0" data-testid="auth-card">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-l from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            مسیر
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? 'به مسیر خوش آمدید' : 'ثبت‌نام در مسیر'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="full_name">نام و نام خانوادگی</Label>
                <Input
                  id="full_name"
                  data-testid="full-name-input"
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required={!isLogin}
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="example@email.com"
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
                data-testid="password-input"
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
              data-testid="auth-submit-button"
              className="w-full h-11 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-md"
              disabled={loading}
            >
              {loading ? 'در حال پردازش...' : isLogin ? 'ورود' : 'ثبت‌نام'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'حساب کاربری دارید؟ وارد شوید'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default memo(AuthPage);