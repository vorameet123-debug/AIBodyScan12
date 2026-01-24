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
    <div className="space-y-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
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
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          About BodyScan AI
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionizing body measurements with AI-powered technology
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/20"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          BodyScan AI was created to make accurate body measurements accessible to everyone. 
          We believe that everyone should have access to precise body measurements without the 
          need for expensive equipment or professional assistance.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
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
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <value.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Technology Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white"
      >
        <div className="flex items-center gap-3 mb-6">
          <Code className="text-white" size={32} />
          <h2 className="text-3xl font-extrabold">Technology Stack</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <h3 className="font-bold text-lg mb-1">{tech.name}</h3>
              <p className="text-white/80 text-sm">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact/Info Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/20 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Get in Touch</h2>
        <p className="text-gray-600 mb-6">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800">Email</p>
            <p className="text-primary-600">support@bodyscan.ai</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800">Version</p>
            <p className="text-purple-600">1.0.0</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
