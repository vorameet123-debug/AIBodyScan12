import React from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Brain, Zap, BarChart3, TrendingUp, Target, Camera, Ruler, 
  Sparkles, CheckCircle, ArrowRight, ShoppingBag, Package, Eye,
  Award, Flame, Crown, Users, Activity, Cpu, LayoutGrid, Palette,
  LineChart, Trophy, Shirt, Heart, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      id: 'body-scan',
      icon: Target,
      title: 'AI Body Scan',
      tagline: 'Your measurements, perfected',
      description: 'Upload front and side photos to get 21+ precise body measurements powered by PARE 3D reconstruction and SMPL-Anthropometry.',
      color: 'violet',
      features: [
        { icon: Camera, text: 'Simple photo upload - front & side views' },
        { icon: Ruler, text: '21+ measurements: chest, waist, hips, arms, legs & more' },
        { icon: Cpu, text: 'PARE + SMPL deep learning technology' },
        { icon: Zap, text: 'Results in under 30 seconds' },
      ],
      cta: 'Start Body Scan',
      path: '/measurements'
    },
    {
      id: '3d-model',
      icon: Eye,
      title: '3D Body Visualization',
      tagline: 'See yourself in a new dimension',
      description: 'Visualize your body with an interactive 3D SMPL model. Rotate, zoom, and explore your body shape from every angle.',
      color: 'cyan',
      features: [
        { icon: Eye, text: 'Interactive 3D SMPL body model' },
        { icon: LayoutGrid, text: 'Rotate and zoom controls' },
        { icon: Activity, text: 'Real-time mesh rendering' },
        { icon: Sparkles, text: 'Personalized to your measurements' },
      ],
      cta: 'View 3D Model',
      path: '/measurements'
    },
    {
      id: 'fit-checker',
      icon: ShoppingBag,
      title: 'FitChecker AI',
      tagline: 'Get roasted before you shop',
      description: 'Upload any clothing photo and get instant fit analysis with our signature roast-style feedback. Know if it fits before you buy.',
      color: 'fuchsia',
      features: [
        { icon: Camera, text: 'Upload any clothing product image' },
        { icon: Flame, text: 'Roast-style fit feedback' },
        { icon: Target, text: 'Fit score with detailed breakdown' },
        { icon: Shirt, text: 'Size recommendation vs your selected size' },
      ],
      cta: 'Try FitChecker',
      path: '/fit-checker'
    },
    {
      id: 'fashion-iq',
      icon: Brain,
      title: 'Fashion IQ',
      tagline: 'Level up your fashion intelligence',
      description: 'Build your Fashion IQ score based on fit knowledge, style consistency, and trend awareness. Earn badges and compete on leaderboards.',
      color: 'purple',
      features: [
        { icon: Award, text: 'Levels: Novice → Learner → Expert → Master' },
        { icon: BarChart3, text: 'Scores: Fit Knowledge, Style, Trend Awareness' },
        { icon: Trophy, text: 'Earn badges for fashion achievements' },
        { icon: Users, text: 'Global leaderboard competition' },
      ],
      cta: 'See Your Fashion IQ',
      path: '/fashion-iq'
    },
    {
      id: 'body-tracker',
      icon: TrendingUp,
      title: 'Body Tracker',
      tagline: 'Track your transformation',
      description: 'Monitor your body changes over time with smart trend analysis. Track measurements, detect patterns, and see your progress.',
      color: 'indigo',
      features: [
        { icon: LineChart, text: 'Body measurement trends over time' },
        { icon: Activity, text: 'Velocity & acceleration metrics' },
        { icon: Target, text: 'Body shape analysis & changes' },
        { icon: Sparkles, text: 'Size change predictions' },
      ],
      cta: 'Track Body Changes',
      path: '/body-tracker'
    },
    {
      id: 'wardrobe',
      icon: Package,
      title: 'Wardrobe Analytics',
      tagline: 'Smart insights for your closet',
      description: 'Analyze your wardrobe composition, color distribution, and identify style gaps. Get personalized recommendations.',
      color: 'blue',
      features: [
        { icon: LayoutGrid, text: 'Wardrobe composition breakdown' },
        { icon: Palette, text: 'Color distribution analysis' },
        { icon: Target, text: 'Style gap identification' },
        { icon: Heart, text: 'Wishlist & purchase tracking' },
      ],
      cta: 'Analyze Wardrobe',
      path: '/wardrobe'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-500 to-violet-600' },
    fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', border: 'border-fuchsia-200', gradient: 'from-fuchsia-500 to-fuchsia-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <section className="relative py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              All Features
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
            >
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Body Intelligence
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              From AI-powered measurements to fashion scoring, explore all the tools that make BodyScan the complete platform for your style journey.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="space-y-24"
          >
            {mainFeatures.map((feature, index) => {
              const colors = colorClasses[feature.color];
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={feature.id}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}>
                    {/* Content Side */}
                    <div className="flex-1 max-w-xl">
                      {/* Icon Badge */}
                      <div className={`inline-flex items-center gap-3 mb-6`}>
                        <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{feature.title}</h2>
                          <p className={`text-sm font-medium ${colors.text}`}>{feature.tagline}</p>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* Feature List */}
                      <div className="space-y-4 mb-8">
                        {feature.features.map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg ${colors.bg}/10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <item.icon className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <span className="text-slate-700">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(feature.path)}
                        className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all`}
                      >
                        {feature.cta}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                    
                    {/* Visual Side - Feature Card */}
                    <div className="flex-1 w-full max-w-lg">
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-3xl opacity-20 blur-2xl`} />
                        
                        {/* Card */}
                        <div className={`relative bg-white rounded-3xl p-8 md:p-10 border-2 ${colors.border} shadow-xl`}>
                          <div className="text-center">
                            {/* Large Icon */}
                            <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${colors.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-2xl`}>
                              <feature.icon className="w-12 h-12 text-white" />
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-500 text-sm">{feature.tagline}</p>
                            
                            {/* Mini Stats */}
                            <div className={`mt-6 pt-6 border-t ${colors.border} grid grid-cols-2 gap-4`}>
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${colors.text}`}>
                                  {feature.id === 'body-scan' ? '21+' : 
                                   feature.id === 'fit-checker' ? '100%' :
                                   feature.id === 'fashion-iq' ? '4' :
                                   feature.id === 'body-tracker' ? '∞' :
                                   feature.id === 'wardrobe' ? '360°' : '3D'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {feature.id === 'body-scan' ? 'Measurements' : 
                                   feature.id === 'fit-checker' ? 'Accuracy' :
                                   feature.id === 'fashion-iq' ? 'Levels' :
                                   feature.id === 'body-tracker' ? 'History' :
                                   feature.id === 'wardrobe' ? 'Analysis' : 'Visualization'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${colors.text}`}>
                                  {feature.id === 'body-scan' ? '<30s' : 
                                   feature.id === 'fit-checker' ? '🔥' :
                                   feature.id === 'fashion-iq' ? '🏆' :
                                   feature.id === 'body-tracker' ? '📈' :
                                   feature.id === 'wardrobe' ? '🎨' : '✨'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {feature.id === 'body-scan' ? 'Processing' : 
                                   feature.id === 'fit-checker' ? 'Roasts' :
                                   feature.id === 'fashion-iq' ? 'Compete' :
                                   feature.id === 'body-tracker' ? 'Trends' :
                                   feature.id === 'wardrobe' ? 'Colors' : 'Interactive'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-10 md:p-14 overflow-hidden text-center"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-br from-purple-500/15 to-indigo-500/15 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Experience All Features?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Start with a free body scan and unlock the full potential of AI-powered body intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/measurements')}
                  className="group flex items-center gap-2 bg-white text-slate-900 font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <Zap className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 text-white/80 hover:text-white font-semibold py-4 px-6 rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  View Pricing
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
