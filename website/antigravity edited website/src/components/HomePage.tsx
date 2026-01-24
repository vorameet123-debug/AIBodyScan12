import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3, TrendingUp, Shield, Clock, Target, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms for accurate body measurements',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: '21+ Measurements',
      description: 'Comprehensive body measurements including all key dimensions',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Size Recommendations',
      description: 'Get personalized clothing size suggestions based on your measurements',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely. We respect your privacy',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Get results in under 30 seconds with our optimized pipeline',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Target,
      title: '99.9% Accuracy',
      description: 'Industry-leading accuracy powered by PARE and SMPL-Anthropometry',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6 shadow-2xl"
        >
          <Brain className="text-white" size={48} />
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to BodyScan AI
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Get accurate body measurements using AI-powered 3D reconstruction. 
          Upload your photos and receive detailed measurements in seconds.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/measurements')}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all text-lg"
        >
          <Sparkles size={22} />
          Get Started Now
          <ArrowRight size={22} />
        </motion.button>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { value: '99.9%', label: 'Accuracy', icon: Target },
          { value: '<30s', label: 'Processing Time', icon: Clock },
          { value: '21+', label: 'Measurements', icon: BarChart3 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <stat.icon className="text-white" size={28} />
            </div>
            <div className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-gray-600 font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need for accurate body measurements
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust BodyScan AI for accurate body measurements
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/measurements')}
            className="inline-flex items-center gap-3 bg-white text-primary-600 font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all text-lg"
          >
            <Zap size={22} />
            Start Measuring Now
            <ArrowRight size={22} />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};
