import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FloatingGenie } from '@/components/FloatingGenie';
import { AuthModal } from '@/components/AuthModal';
import { fadeIn, staggerContainer } from '@/utils/motion';
import { Sparkles, Brain, Target, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/config/firebase'; // adjust path if needed

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showNavbar, setShowNavbar] = useState(false);

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const handleScroll = () => setShowNavbar(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/explore');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">GENIE</span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Button onClick={() => navigate('/explore')}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => openAuth('login')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </Button>
                <Button onClick={() => openAuth('signup')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
      >
        {/* Floating Genie */}
        <motion.div variants={fadeIn('down', 0.2)}>
          <FloatingGenie size="lg" />
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeIn('up', 0.4)} className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="gradient-text">GENIE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your Gamified AI Companion for Emotional Intelligence and Cognitive Growth
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={fadeIn('up', 0.6)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12"
        >
          {[
            { icon: Brain, title: 'Emotion Detection', desc: 'Real-time facial emotion tracking' },
            { icon: Sparkles, title: 'AI Tutor', desc: 'Adaptive learning companion' },
            { icon: Target, title: 'Gamified Progress', desc: 'XP, streaks, and achievements' },
          ].map((feature, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeIn('up', 0.8)}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <>
  <Button
    size="lg"
    onClick={() => openAuth('signup')}
    className="text-lg px-8 py-6 shadow-neon-blue hover:shadow-neon-pink transition-all"
  >
    <Sparkles className="w-5 h-5 mr-2" />
    Sign Up
  </Button>

  <Button
    size="lg"
    variant="outline"
    onClick={() => openAuth('login')}
    className="text-lg px-8 py-6"
  >
    <LogIn className="w-5 h-5 mr-2" />
    Log In
  </Button>

  <Button
    size="lg"
    variant="secondary"
    onClick={handleGoogleLogin}
    className="text-lg px-8 py-6 bg-red-500 hover:bg-red-600 text-white"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      className="w-5 h-5 mr-2"
    >
      <path
        fill="currentColor"
        d="M488 261.8c0-17.8-1.6-35.1-4.7-51.8H249v98.1h135c-5.8 31.4-23.5 57.9-50.1 75.8v62.7h81c47.4-43.7 74.1-108 74.1-184.8z"
      />
    </svg>
    Continue with Google
  </Button>
</>
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultMode={authMode} />
    </div>
  );
};

export default Landing;
