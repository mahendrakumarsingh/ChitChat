import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AuthScreen = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const cardRef = useRef(null);
  const inputsRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    const tl = gsap.timeline();

    tl.fromTo(
      cardRef.current,
      { rotateX: 90, scale: 0.8, opacity: 0 },
      { rotateX: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power4.out' }
    );

    tl.fromTo(
      titleRef.current?.querySelectorAll('span') || [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.03, ease: 'power4.out' },
      '-=0.8'
    );

    tl.fromTo(
      inputsRef.current?.children || [],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power4.out' },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await onLogin(formData.email, formData.password);
      } else {
        result = await onRegister(formData.name, formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error);
        // Shake animation
        gsap.timeline()
          .to(cardRef.current, { x: -10, duration: 0.08, ease: 'power2.out' })
          .to(cardRef.current, { x: 10, duration: 0.08, ease: 'power2.inOut' })
          .to(cardRef.current, { x: -10, duration: 0.08, ease: 'power2.inOut' })
          .to(cardRef.current, { x: 10, duration: 0.08, ease: 'power2.inOut' })
          .to(cardRef.current, { x: 0, duration: 0.08, ease: 'power2.in' });
      } else if (!isLogin) {
        // If registration successful, switch to login
        setIsLogin(true);
        setError('Registration successful! Please sign in.');
        setFormData(prev => ({ ...prev, password: '' })); // Clear password
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');

    // Simple fade/scale animation instead of rotateY
    gsap.fromTo(cardRef.current,
      { scale: 0.95, opacity: 0.8 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  };

  const titleText = isLogin ? 'Welcome Back' : 'Create Account';

  return (
    <div className="min-h-screen w-full flex items-center justify-center nebula-bg relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[var(--electric-blue)] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md mx-4 perspective-1000"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 shimmer pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] flex items-center justify-center glow-blue animate-float">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-3xl font-bold text-center mb-2 text-[var(--text-primary)]"
          >
            {titleText.split('').map((char, i) => (
              <span key={i} className="inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className="text-center text-[var(--text-muted)] mb-8">
            {isLogin ? 'Enter the conversation.' : 'Join the community.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--crimson)]/10 border border-[var(--crimson)]/30 text-[var(--crimson)] text-sm text-center animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div ref={inputsRef} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[var(--text-primary)]">
                    Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] input-glow transition-all duration-300"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--text-primary)]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] input-glow transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--text-primary)]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] input-glow transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full liquid-btn bg-[var(--surface-light)] hover:bg-[var(--electric-blue)] text-[var(--text-primary)] hover:text-white border border-[var(--surface-light)] hover:border-[var(--electric-blue)] transition-all duration-500 h-12 mt-6"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[var(--electric-blue)] hover:text-[var(--text-primary)] transition-colors duration-300 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[var(--surface-light)]">
            <p className="text-xs text-center text-[var(--text-muted)]">
              Demo: Use <span className="text-[var(--electric-blue)]">alex@example.com</span> or{' '}
              <span className="text-[var(--electric-blue)]">sarah@example.com</span> with any password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};