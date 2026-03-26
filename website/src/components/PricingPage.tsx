import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Sparkles, Zap, Crown, Star, ArrowRight,
  Target, ShoppingBag, Brain, TrendingUp, Package, Eye,
  Users, Shield, Headphones, Infinity, Gift, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentService, SubscriptionStatus } from '../services/paymentService';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch subscription status on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const status = await paymentService.getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out BodyScan AI',
      price: { monthly: 0, yearly: 0 },
      icon: Sparkles,
      color: 'slate',
      popular: false,
      features: [
        { text: '3 Body Scans per month', included: true },
        { text: '3 FitChecker analyses', included: true },
        { text: 'Basic 3D visualization', included: true },
        { text: 'Fashion IQ score', included: true },
        { text: 'Save up to 3 measurements', included: true },
        { text: 'Body Tracker (7-day history)', included: true },
        { text: 'Wardrobe & Trend Analytics', included: false },
        { text: 'Trend Dashboard', included: false },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false },
      ],
      cta: 'Get Started Free',
      ctaAction: () => navigate('/measurements')
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For fashion enthusiasts and regular users',
      price: { monthly: 999, yearly: 666 }, // ₹999/month or ₹666/month (yearly)
      icon: Zap,
      color: 'violet',
      popular: true,
      features: [
        { text: 'Unlimited Body Scans', included: true },
        { text: 'Unlimited FitChecker analyses', included: true },
        { text: 'Advanced 3D visualization', included: true },
        { text: 'Full Fashion IQ with badges', included: true },
        { text: 'Unlimited saved measurements', included: true },
        { text: 'Body Tracker (full history)', included: true },
        { text: 'Wardrobe & Trend Analytics', included: true },
        { text: 'Trend Dashboard', included: true },
        { text: 'Email support', included: true },
        { text: 'API access', included: false },
      ],
      cta: 'Get Pro Now',
      ctaAction: () => handlePayment('pro')
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For businesses and power users',
      price: { monthly: 4000, yearly: 3333 }, // ₹4000/month or ₹3333/month (yearly)
      icon: Crown,
      color: 'amber',
      popular: false,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Team accounts (up to 10)', included: true },
        { text: 'White-label options', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority queue processing', included: true },
        { text: 'Full API access', included: true },
        { text: 'Dedicated support', included: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Custom training', included: true },
      ],
      cta: 'Contact Sales',
      ctaAction: () => window.location.href = 'mailto:enterprise@bodyscan.ai?subject=Enterprise Plan Inquiry'
    },
  ];

  // Handle payment initiation
  const handlePayment = async (planId: 'pro' | 'enterprise') => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please sign in to purchase a subscription');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    await paymentService.initiateCheckout(
      planId,
      billingCycle,
      // Success callback
      () => {
        setIsProcessing(false);
        toast.success('🎉 Payment successful! Your subscription is now active.');
        navigate('/measurements');
      },
      // Failure callback
      (error) => {
        setIsProcessing(false);

        // Check if it's an authentication error
        if (error.includes('credentials') || error.includes('Unauthorized') || error.includes('401')) {
          toast.error('Your session has expired. Please sign in again.');
          localStorage.removeItem('auth_token');
          navigate('/login');
        } else {
          toast.error(`Payment failed: ${error}`);
        }
      }
    );
  };

  const faqs = [
    {
      q: 'What counts as a Body Scan?',
      a: 'A Body Scan is when you upload photos to get your measurements. Each successful measurement extraction counts as one scan.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Your subscription runs for the purchased period (monthly or yearly). Once purchased, the subscription cannot be cancelled mid-term, but it will not auto-renew unless you choose to renew.'
    },
    {
      q: 'What is your refund policy?',
      a: 'Due to the nature of our AI-powered service, all purchases are final and non-refundable. We recommend trying the free tier first to ensure our service meets your needs.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and popular wallets like Paytm, PhonePe, and GPay via Razorpay.'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-violet-950/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-950/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <section className="relative py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 text-violet-400 rounded-full text-sm font-semibold mb-6 border border-violet-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Start free with 3 scans/month
            </motion.span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                  Save 33%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {plans.map((plan) => {
              const price = plan.price[billingCycle];
              const Icon = plan.icon;

              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold rounded-full shadow-lg">
                        <Star className="w-4 h-4 fill-white" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`relative h-full bento-card p-8 border-2 transition-all ${plan.popular
                    ? 'border-violet-500/50 shadow-2xl shadow-violet-500/10'
                    : 'hover:border-slate-600'
                    }`}>
                    {/* Plan Header */}
                    <div className="mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${plan.color === 'violet' ? 'bg-violet-500/20' :
                        plan.color === 'amber' ? 'bg-amber-500/20' : 'bg-slate-700'
                        }`}>
                        <Icon className={`w-7 h-7 ${plan.color === 'violet' ? 'text-violet-400' :
                          plan.color === 'amber' ? 'text-amber-400' : 'text-slate-400'
                          }`} />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-slate-400 text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-white">
                          ₹{price}
                        </span>
                        {price > 0 && (
                          <span className="text-slate-400">/month</span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && price > 0 && (
                        <p className="text-sm text-slate-500 mt-1">
                          Billed ₹{price * 12}/year
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    {/* Check if this is the user's current plan */}
                    {subscription?.is_active && subscription.plan_type === 'premium' && plan.id === 'pro' ? (
                      <div className="space-y-3">
                        <div className="w-full py-4 px-6 rounded-xl font-semibold text-center bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" />
                          Current Plan
                        </div>
                        {subscription.days_remaining && (
                          <p className="text-sm text-slate-400 text-center flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {subscription.days_remaining} days remaining
                          </p>
                        )}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={plan.ctaAction}
                        disabled={isProcessing || isLoadingSubscription}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2 ${plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl'
                          : plan.color === 'amber'
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                          } ${(isProcessing || isLoadingSubscription) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoadingSubscription ? 'Loading...' : plan.cta}
                        {!isLoadingSubscription && <ArrowRight className="w-4 h-4" />}
                      </motion.button>
                    )}

                    {/* Features List */}
                    <div className="mt-8 pt-8 border-t border-slate-700/50">
                      <p className="text-sm font-semibold text-white mb-4">What's included:</p>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What You Get with Each Plan
            </h2>
            <p className="text-lg text-slate-400">
              Compare features across all plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Target, title: 'Body Scan', free: '3/month', pro: 'Unlimited', enterprise: 'Unlimited' },
              { icon: ShoppingBag, title: 'FitChecker', free: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
              { icon: Eye, title: '3D Model', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
              { icon: Brain, title: 'Fashion IQ', free: 'Score only', pro: 'Full + Badges', enterprise: 'Full + Badges' },
              { icon: TrendingUp, title: 'Body Tracker', free: '7 days', pro: 'Full history', enterprise: 'Full history' },
              { icon: Package, title: 'Wardrobe', free: '—', pro: 'Full access', enterprise: 'Full access' },
            ].map((feature, idx) => (
              <div key={idx} className="bento-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Free</span>
                    <span className="font-medium text-slate-300">{feature.free}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700/50">
                    <span className="text-violet-400 font-medium">Pro</span>
                    <span className="font-semibold text-violet-400">{feature.pro}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-amber-400 font-medium">Enterprise</span>
                    <span className="font-semibold text-amber-400">{feature.enterprise}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: Users, text: '10K+ Users' },
              { icon: Headphones, text: '24/7 Support' },
              { icon: Infinity, text: 'No Lock-in' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
                  <item.icon className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bento-card p-6"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Try BodyScan AI free and upgrade whenever you're ready.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/measurements')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 px-10 rounded-xl shadow-xl shadow-violet-500/25 hover:shadow-2xl transition-all"
            >
              <Zap className="w-5 h-5" />
              Start Free Body Scan
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
