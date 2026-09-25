import React, { useState } from 'react';
import { Page, ContactFormData } from '../../types';
import { FAQ_ITEMS } from '../../data/fitnessData';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Headphones,
  Database
} from 'lucide-react';

interface ContactPageProps {
  setCurrentPage: (page: Page) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Accordion state for FAQ
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSuccess(false);

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Please enter a subject line.');
      return;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      setErrorMessage('Please include a message of at least 10 characters.');
      return;
    }

    setIsLoading(true);

    const messageId = 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const messageDoc = {
      id: messageId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    try {
      await setDoc(doc(db, 'contact_messages', messageId), messageDoc);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.CREATE, `contact_messages/${messageId}`);
      setErrorMessage('Failed to submit message to cloud database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Headphones className="w-3.5 h-3.5" />
            Support &amp; Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            Get in Touch with Fitness AI
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Have questions about our training algorithms, equipment evaluations, or partnership inquiries? Our team is here to assist you.
          </p>
        </div>

        {/* Contact Form & Contact Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold font-display text-white">Send Us a Message</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Fill out the form below and an exercise specialist will reply within 24 hours.
                </p>
              </div>

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-start gap-3 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Message successfully received!</span>
                    <span>Thank you for reaching out. We have logged your request and will respond to your email promptly.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="input-contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Taylor Smith"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="input-contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="taylor@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <input
                    id="input-contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Question about Workout Periodization or Nutrition AI"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="input-contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question, feedback, or training inquiry..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <button
                  id="btn-contact-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Contact Information Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-display text-white">Contact Information</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Connect with our dedicated support and physiology review team directly through our official channels.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Direct Email</span>
                    <a
                      href="mailto:support@fitnessai.app"
                      className="font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      support@fitnessai.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Response Hours</span>
                    <span className="font-semibold text-white">Monday – Friday: 8 AM – 8 PM EST</span>
                    <p className="text-xs text-slate-400 mt-0.5">Average response time: &lt; 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">AI Sports Lab</span>
                    <span className="font-semibold text-white">500 Innovation Way, Suite 400</span>
                    <p className="text-xs text-slate-400 mt-0.5">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>

              {/* Social & Community note */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
                  Athlete Community
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join our open Discord fitness channel to share workout logs, review meal prep recipes, and test community challenge streaks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-bold font-display text-white">
              Got Questions? We&apos;ve Got Answers.
            </h2>
            <p className="text-sm text-slate-400">
              Clear answers to the most common questions about Fitness AI, our exercise science philosophy, and Version 1 features.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-white hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base">
                      {faq.question}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
