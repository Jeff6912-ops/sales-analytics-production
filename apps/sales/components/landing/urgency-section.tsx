"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

const liveStats = [
  {
    icon: <DollarSign className="size-5 text-green-500" />,
    label: "Deals saved this month",
    value: 1247,
    increment: 1,
    color: "green"
  },
  {
    icon: <TrendingUp className="size-5 text-blue-500" />,
    label: "Coaching opportunities identified",
    value: 18420,
    increment: 3,
    color: "blue"
  },
  {
    icon: <Clock className="size-5 text-purple-500" />,
    label: "Hours reclaimed from manual reviews",
    value: 8960,
    increment: 2,
    color: "purple"
  },
  {
    icon: <Users className="size-5 text-orange-500" />,
    label: "Sales reps transformed",
    value: 2340,
    increment: 1,
    color: "orange"
  }
];

export default function UrgencySection() {
  const [stats, setStats] = useState(liveStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.value + Math.floor(Math.random() * stat.increment) + 1
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <AlertTriangle className="size-4" />
            Every Day Without Insights Is Revenue Lost
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            While You're Reading This...
          </h2>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Other sales managers are already getting ahead with AI-powered insights. 
            Don't let another week pass flying blind.
          </p>
        </div>

        {/* Live Counter Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${stat.color}-500/20 rounded-lg`}>
                  {stat.icon}
                </div>
                <div className="text-white/80 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-white/60 mt-1">
                📈 Live counter updating
              </div>
            </motion.div>
          ))}
        </div>

        {/* Time-Sensitive Offer */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                🔥 Limited Time: Next 50 Signups Only
              </h3>
              <p className="text-xl mb-8 text-white/90">
                Get these exclusive bonuses worth $794 when you start your free trial today:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Personalized Onboarding</h4>
                  <p className="text-sm text-white/80">1-on-1 setup session</p>
                  <p className="text-xs text-yellow-300">$297 value</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Custom Integration</h4>
                  <p className="text-sm text-white/80">We connect everything for you</p>
                  <p className="text-xs text-yellow-300">$497 value</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Success Guarantee</h4>
                  <p className="text-sm text-white/80">We guarantee results or refund</p>
                  <p className="text-xs text-yellow-300">Priceless</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
                  Claim Your Bonuses + Start Free Trial
                </button>
                <p className="text-sm text-white/80">
                  ⏰ Bonuses expire when we hit 50 signups
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Ticker */}
        <div className="mt-16 text-center">
          <p className="text-red-200 mb-6">
            Don't take our word for it - see what's happening right now:
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="bg-white/10 px-4 py-2 rounded-full">
              💬 "Just discovered why Johnson closes 3x more deals" - Sarah M.
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full">
              🎯 "Found our biggest objection pattern in 2 days" - Mike R.
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full">
              📈 "Team close rate up 18% in first month" - David L.
            </div>
          </div>
        </div>

        {/* Final Urgency Push */}
        <div className="text-center mt-12">
          <p className="text-xl text-red-100 mb-4">
            Every call that happens without insights is a missed opportunity to improve.
          </p>
          <p className="text-lg text-red-200">
            How many deals will you lose this week while trying to figure out what went wrong?
          </p>
        </div>
      </div>
    </section>
  );
} 