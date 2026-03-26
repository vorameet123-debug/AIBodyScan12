/**
 * Terms of Service Page
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();
  const lastUpdated = 'March 20, 2026';

  return (
    <div className="container mx-auto px-6 max-w-4xl py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-fuchsia-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </div>
        <p className="text-slate-400 mb-10">Last updated: {lastUpdated}</p>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using BodyScan AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>BodyScan AI is an AI-powered body measurement and fashion intelligence platform that provides:</p>
            <ul>
              <li>AI body measurements from uploaded photos</li>
              <li>Clothing fit analysis and size recommendations</li>
              <li>Wardrobe analytics and fashion intelligence scoring</li>
              <li>Body tracking over time</li>
              <li>Trend analysis and style recommendations</li>
            </ul>
          </Section>

          <Section title="3. User Accounts">
            <ul>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your password</li>
              <li>You must be at least 16 years old to use the Service</li>
              <li>One person or entity may not maintain more than one account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </Section>

          <Section title="4. AI Disclaimer">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-300 font-medium">⚠️ Important AI Disclosure</p>
              <p className="text-amber-200/80 mt-2">Body measurements are <strong>AI-generated estimates</strong> and may not be 100% accurate. They are provided for fashion and sizing convenience only and should <strong>not</strong> be used for medical, health, fitness, or diagnostic purposes. Always consult a professional for precise measurements.</p>
            </div>
          </Section>

          <Section title="5. Subscription & Payments">
            <h4 className="text-white font-semibold mt-4">5.1 Plans</h4>
            <ul>
              <li><strong>Free:</strong> Limited access to basic features</li>
              <li><strong>Pro:</strong> Full access to all features (₹999/month or ₹7,992/year)</li>
              <li><strong>Enterprise:</strong> Custom solutions (₹4,000/month or ₹39,996/year)</li>
            </ul>
            <h4 className="text-white font-semibold mt-4">5.2 Billing</h4>
            <ul>
              <li>Payments are processed securely through Razorpay</li>
              <li>Subscriptions are billed at the start of each billing period</li>
              <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
            </ul>
            <h4 className="text-white font-semibold mt-4">5.3 Refund Policy</h4>
            <ul>
              <li>Refunds are available within 7 days of purchase if you have not used premium features</li>
              <li>To request a refund, contact <a href="mailto:aibodyscan123@gmail.com" className="text-accent-400 hover:text-accent-300">aibodyscan123@gmail.com</a> with your order ID</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ul>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Upload inappropriate, offensive, or illegal content</li>
              <li>Upload images of other people without their consent</li>
              <li>Attempt to reverse-engineer our AI models or algorithms</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or overload the Service</li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <ul>
              <li>All content, features, and technology in the Service are owned by BodyScan AI</li>
              <li>You retain ownership of photos you upload; we do not claim any rights to your images</li>
              <li>Measurement results are provided to you for personal use only</li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We are not liable for any inaccuracies in AI-generated measurements</li>
              <li>We are not liable for any purchases or decisions made based on our size recommendations</li>
              <li>Our total liability shall not exceed the amount paid by you in the last 12 months</li>
            </ul>
          </Section>

          <Section title="9. Termination">
            <p>Either party may terminate this agreement at any time. Upon termination:</p>
            <ul>
              <li>Your access to premium features will be revoked</li>
              <li>Your measurement data will be retained for 30 days, then permanently deleted</li>
              <li>You can request immediate data deletion via your Profile settings</li>
            </ul>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of [Your City], India.</p>
          </Section>

          <Section title="11. Changes to Terms">
            <p>We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms. We will notify you of material changes via email.</p>
          </Section>

          <Section title="12. Contact">
            <p>For questions about these Terms:</p>
            <ul>
              <li>Email: <a href="mailto:aibodyscan123@gmail.com" className="text-accent-400 hover:text-accent-300">aibodyscan123@gmail.com</a></li>
            </ul>
          </Section>
        </div>
      </motion.div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-6">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    <div className="text-slate-300 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-slate-400">
      {children}
    </div>
  </div>
);

export default TermsOfServicePage;
