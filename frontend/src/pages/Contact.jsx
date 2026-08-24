import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Phone, ArrowLeft, CheckCircle, Clock, MapPin, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link to="/">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Home</span>
          </motion.button>
        </Link>
      </div>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-black italic uppercase mb-4">
              Get in <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">Touch</span>
            </h1>
            <p className="text-slate-400 text-lg">We're here to help you reach your athletic potential.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.a 
              href="mailto:shivamkumarp447@gmail.com" 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="group bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Mail className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase italic text-white">Email Support</h3>
                  <p className="text-sm text-blue-400">24/7 Response</p>
                </div>
              </div>
              <p className="text-slate-300 mb-2 font-medium">shivamkumarp447@gmail.com</p>
              <span className="text-blue-400 text-sm font-bold uppercase group-hover:underline flex items-center gap-2">
                Send Message <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>

            <motion.a 
              href="tel:+918252980774" 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="group bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-green-500/20 rounded-lg hover:border-green-500/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Phone className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase italic text-white">Call Directly</h3>
                  <p className="text-sm text-green-400">Mon-Sat 9AM-6PM</p>
                </div>
              </div>
              <p className="text-slate-300 mb-2 font-medium">+91 82529 80774</p>
              <span className="text-green-400 text-sm font-bold uppercase group-hover:underline flex items-center gap-2">
                Call Now <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </span>
            </motion.a>
          </div>

          {/* Additional Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-lg p-8"
          >
            <h3 className="text-xl font-bold mb-4 text-white text-center">Need Help Getting Started?</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto text-center">
              Our team is available to answer questions, provide platform demos, and help you maximize your athletic profile. 
              Whether you're an athlete, coach, or scout, we're here to support your journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Quick Response</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Expert Guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free Consultation</span>
              </div>
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 grid md:grid-cols-2 gap-6"
          >
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-white">Business Hours</h4>
              </div>
              <div className="space-y-2 text-slate-400 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="text-white font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="text-white font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="text-slate-500">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-bold text-white">Location</h4>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                SportNova Platform<br />
                Digital Sports Hub<br />
                India
              </p>
              <p className="text-slate-500 text-xs italic">
                * Remote support available worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
