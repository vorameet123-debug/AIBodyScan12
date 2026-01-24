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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-5">
          <Brain className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          About BodyScan AI
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Revolutionizing body measurements with AI-powered technology
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-8 shadow-bento border border-slate-200/60"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          BodyScan AI was created to make accurate body measurements accessible to everyone. 
          We believe that everyone should have access to precise body measurements without the 
          need for expensive equipment or professional assistance.
        </p>
        <p className="text-slate-600 leading-relaxed">
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
        <h2 className="text-xl font-bold text-center mb-6 text-slate-900">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-bento border border-slate-200/60 hover:shadow-lg transition-shadow"
            >
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                <value.icon className="text-indigo-600" size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{value.title}</h3>
              <p className="text-sm text-slate-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Technology Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-900 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-5">
          <Code className="text-indigo-400" size={24} />
          <h2 className="text-xl font-bold">Technology Stack</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white/10 rounded-xl p-4"
            >
              <h3 className="font-semibold text-sm mb-1">{tech.name}</h3>
              <p className="text-white/70 text-xs">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact/Info Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-white rounded-2xl p-8 shadow-bento border border-slate-200/60 text-center"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-3">Get in Touch</h2>
        <p className="text-slate-600 mb-5">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
            <p className="font-semibold text-sm text-slate-900">Email</p>
            <p className="text-indigo-600 text-sm">support@bodyscan.ai</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
            <p className="font-semibold text-sm text-slate-900">Version</p>
            <p className="text-indigo-600 text-sm">1.0.0</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
