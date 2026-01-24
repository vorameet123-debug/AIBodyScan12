import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Zap, BarChart3, TrendingUp, Shield, Clock, Target, 
  Camera, Ruler, Users, Database, Sparkles, CheckCircle 
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const mainFeatures = [
    {
      icon: Camera,
      title: 'Easy Photo Upload',
      description: 'Simply upload front and side view photos. Our AI handles the rest.',
      details: [
        'Drag and drop interface',
        'Supports multiple image formats',
        'Automatic image processing',
      ],
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning models analyze your photos with precision.',
      details: [
        'PARE 3D reconstruction',
        'SMPL-Anthropometry measurements',
        'Deep learning algorithms',
      ],
    },
    {
      icon: BarChart3,
      title: '21+ Body Measurements',
      description: 'Get comprehensive measurements including all key body dimensions.',
      details: [
        'Chest, waist, hip circumference',
        'Arm and leg measurements',
        'Height and length measurements',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Size Recommendations',
      description: 'Get personalized clothing size suggestions based on your measurements.',
      details: [
        'Multiple clothing categories',
        'Gender-aware sizing',
        'Age-based recommendations',
      ],
    },
    {
      icon: Database,
      title: 'Save Your Measurements',
      description: 'Store multiple measurement sets with custom names for easy access.',
      details: [
        'Unlimited saved measurements',
        'Custom naming system',
        'Easy retrieval and comparison',
      ],
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely. We respect your privacy.',
      details: [
        'End-to-end encryption',
        'No data sharing',
        'GDPR compliant',
      ],
    },
  ];

  const benefits = [
    { icon: Clock, text: 'Fast processing in under 30 seconds' },
    { icon: Target, text: '99.9% accuracy rate' },
    { icon: Users, text: 'Trusted by thousands of users' },
    { icon: Sparkles, text: 'Cutting-edge AI technology' },
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Features
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover all the powerful features that make BodyScan AI the best choice for body measurements
        </p>
      </motion.div>

      {/* Main Features */}
      <div className="space-y-8">
        {mainFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20`}
          >
            <div className="flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{feature.title}</h2>
              <p className="text-lg text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="text-primary-600" size={64} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8">Why Choose BodyScan AI?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
            >
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="text-white" size={32} />
              </div>
              <p className="font-semibold">{benefit.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
