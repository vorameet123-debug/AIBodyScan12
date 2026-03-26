import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Users, Award, Code, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Accuracy First',
      description: 'We prioritize precision in every measurement, ensuring you get reliable results.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Our platform is designed with you in mind, making body measurements simple and accessible.',
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'We use cutting-edge AI technology to provide the best measurement experience.',
    },
    {
      icon: Heart,
      title: 'Privacy',
      description: 'Your data is yours. We ensure complete privacy and security of your information.',
    },
  ];

  const techStack = [
    { name: 'PARE', description: '3D human pose and shape estimation' },
    { name: 'SMPL-Anthropometry', description: 'Accurate body measurement extraction' },
    { name: 'React', description: 'Modern, responsive user interface' },
    { name: 'FastAPI', description: 'High-performance backend API' },
    { name: 'Machine Learning', description: 'Advanced AI algorithms' },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl mb-5">
          <Brain className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          About BodyScan AI
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Revolutionizing body measurements with AI-powered technology
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bento-card p-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          BodyScan AI was created to make accurate body measurements accessible to everyone. 
          We believe that everyone should have access to precise body measurements without the 
          need for expensive equipment or professional assistance.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Using state-of-the-art AI technology, we provide accurate, fast, and convenient 
          body measurements that help you make informed decisions about clothing, fitness, 
          and health.
        </p>
      </motion.section>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-center mb-6 text-white">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bento-card p-5 hover:border-slate-600 transition-all"
            >
              <div className="w-11 h-11 bg-accent-500/20 rounded-xl flex items-center justify-center mb-3">
                <value.icon className="text-accent-400" size={22} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{value.title}</h3>
              <p className="text-sm text-slate-400">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Technology Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white border border-slate-700/50"
      >
        <div className="flex items-center gap-3 mb-5">
          <Code className="text-accent-400" size={24} />
          <h2 className="text-xl font-bold">Technology Stack</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50"
            >
              <h3 className="font-semibold text-sm mb-1 text-white">{tech.name}</h3>
              <p className="text-slate-400 text-xs">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact/Info Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bento-card p-8 text-center"
      >
        <h2 className="text-xl font-bold text-white mb-3">Get in Touch</h2>
        <p className="text-slate-400 mb-5">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="font-semibold text-sm text-white">Email</p>
            <p className="text-accent-400 text-sm">support@bodyscan.ai</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="font-semibold text-sm text-white">Version</p>
            <p className="text-accent-400 text-sm">1.0.0</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
