import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Brain, Zap, BarChart3, TrendingUp, Target, Sparkles, ArrowRight, 
  Play, Ruler, ShoppingBag, Package, Crown, Star, Users, Globe,
  CheckCircle, ArrowUpRight, Cpu, Layers, Activity, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  const coreFeatures = [
    {
      icon: Target,
      title: 'AI Body Scan',
      description: 'Get 21+ precise body measurements from just 2 photos using advanced AI',
      color: 'violet',
      path: '/measurements'
    },
    {
      icon: ShoppingBag,
      title: 'FitChecker AI',
      description: 'Upload clothing photos and get instant fit analysis with roast-style feedback',
      color: 'fuchsia',
      path: '/fit-checker'
    },
    {
      icon: Brain,
      title: 'Fashion IQ',
      description: 'Build your fashion intelligence score with levels, badges, and leaderboards',
      color: 'purple',
      path: '/fashion-iq'
    },
    {
      icon: TrendingUp,
      title: 'Body Tracker',
      description: 'Track your body changes over time with smart insights and velocity metrics',
      color: 'indigo',
      path: '/body-tracker'
    },
    {
      icon: Package,
      title: 'Wardrobe Analytics',
      description: 'Smart analysis of your wardrobe composition, colors, and style gaps',
      color: 'blue',
      path: '/wardrobe'
    },
    {
      icon: Eye,
      title: '3D Body Model',
      description: 'Visualize your body with an interactive 3D SMPL model you can rotate',
      color: 'cyan',
      path: '/measurements'
    },
  ];

  const stats = [
    { value: '21+', label: 'Body Measurements', description: 'Chest, waist, hips, arms, legs & more' },
    { value: '<30s', label: 'Processing Time', description: 'Lightning-fast AI analysis' },
    { value: '99.9%', label: 'Accuracy Rate', description: 'Industry-leading precision' },
    { value: '3D', label: 'Body Visualization', description: 'Interactive SMPL model' },
  ];

  const testimonials = [
    { name: 'Sarah K.', role: 'Fashion Blogger', text: 'Finally! No more guessing sizes online. This is game-changing.', rating: 5 },
    { name: 'Mike T.', role: 'Fitness Enthusiast', text: 'I track my body measurements weekly. Love the trend analysis!', rating: 5 },
    { name: 'Emily R.', role: 'Online Shopper', text: 'The FitChecker roasts are hilarious but actually super helpful.', rating: 5 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-200/30 via-purple-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-fuchsia-200/20 via-pink-200/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-24"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-full mb-8 border border-violet-200/50"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                <Cpu className="w-4 h-4" />
                AI-Powered
              </span>
              <span className="w-px h-4 bg-violet-200" />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fuchsia-700">
                <Layers className="w-4 h-4" />
                3D Modeling
              </span>
              <span className="w-px h-4 bg-violet-200" />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
                <Activity className="w-4 h-4" />
                Real-time
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-6 leading-[0.95]"
            >
              Your Body.{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Decoded.
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Upload 2 photos. Get 21+ precise measurements. Visualize in 3D.
              <span className="text-slate-900 font-semibold"> Plus FitChecker, Fashion IQ, Body Tracking</span> & more.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/measurements')}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold py-5 px-10 rounded-2xl shadow-2xl shadow-violet-500/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-lg">Start Body Scan</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/features')}
                className="flex items-center gap-3 text-slate-700 hover:text-slate-900 font-semibold py-5 px-8 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-lg transition-all"
              >
                <Play className="w-5 h-5" />
                <span className="text-lg">See All Features</span>
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Results in 30 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Privacy-first approach</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative bg-white rounded-3xl p-8 border border-slate-200/60 hover:border-violet-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-slate-500">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section ref={featuresRef} className="relative py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Everything You Need
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              One Platform.{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Endless Possibilities.
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From precise measurements to fashion intelligence, we've got every aspect of your style journey covered.
            </p>
          </motion.div>

          {/* Features Grid - Bento Style */}
          <motion.div 
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {coreFeatures.map((feature, index) => {
              const colorClasses: Record<string, string> = {
                violet: 'from-violet-500 to-violet-600 shadow-violet-500/25',
                fuchsia: 'from-fuchsia-500 to-fuchsia-600 shadow-fuchsia-500/25',
                purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
                indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
                blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
                cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/25',
              };

              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  onClick={() => navigate(feature.path)}
                  className="group cursor-pointer"
                >
                  <div className="relative bg-white rounded-3xl p-8 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-2xl transition-all duration-300 h-full">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[feature.color]} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="relative py-24 bg-gradient-to-b from-white via-violet-50/30 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by Users Worldwide
            </motion.h2>
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>50+ Countries</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Background Card */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] transform rotate-1" />
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-12 md:p-16 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-500/15 to-indigo-500/15 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
              
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30"
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to Transform Your Style?
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands who've discovered their perfect fit. Start your body intelligence journey today.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/measurements')}
                    className="group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold py-5 px-10 rounded-2xl shadow-2xl transition-all"
                  >
                    <Zap className="w-5 h-5" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-semibold py-5 px-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all"
                  >
                    <Crown className="w-5 h-5" />
                    View Pricing
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
