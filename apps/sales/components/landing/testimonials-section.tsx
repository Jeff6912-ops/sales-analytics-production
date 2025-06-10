"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Play, Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Marcus Rodriguez",
    title: "Sales Director",
    company: "TechFlow Solutions",
    image: "/testimonial-1.jpg",
    rating: 5,
    quote: "I went from spending 40+ hours a week trying to understand why my team was underperforming to having instant insights that actually help. Found out Johnson was asking 3x more discovery questions than Smith - boom, there's why he's closing more deals.",
    results: "67% increase in top performer retention",
    videoThumbnail: "/video-thumb-1.jpg",
    hasVideo: true
  },
  {
    id: 2,
    name: "Sarah Chen",
    title: "VP of Sales",
    company: "Growth Dynamics",
    image: "/testimonial-2.jpg",
    rating: 5,
    quote: "The objection intelligence feature is a game-changer. We discovered that 68% of our lost deals had the same pricing objection that we weren't handling well. Fixed our script, trained the team, boom - 23% close rate improvement in 30 days.",
    results: "23% close rate improvement in 30 days",
    videoThumbnail: "/video-thumb-2.jpg",
    hasVideo: true
  },
  {
    id: 3,
    name: "David Park",
    title: "Sales Manager",
    company: "Apex Marketing",
    image: "/testimonial-3.jpg",
    rating: 5,
    quote: "Finally sleep at night knowing I understand what's happening with my team. The HeatCheck scores told me exactly which reps needed help and what kind. My pipeline reviews went from guessing games to strategic sessions.",
    results: "Saved 25 hours/week on call analysis",
    videoThumbnail: "/video-thumb-3.jpg",
    hasVideo: false
  }
];

const stats = [
  { label: "Sales Teams Transformed", value: "500+" },
  { label: "Deals Saved This Month", value: "1,247" },
  { label: "Hours Reclaimed Weekly", value: "12,000+" },
  { label: "Average Close Rate Increase", value: "18%" }
];

export default function TestimonialsSection() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sales Managers Who 
            <span className="text-blue-400"> Sleep at Night</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real stories from sales leaders who transformed their teams with AI-powered insights
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {testimonial.title}
                        </p>
                        <p className="text-xs text-blue-400">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="mb-4">
                    <Quote className="size-6 text-blue-400 mb-2" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Results */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <p className="text-green-400 font-semibold text-sm">
                      📈 {testimonial.results}
                    </p>
                  </div>

                  {/* Video Thumbnail (if available) */}
                  {testimonial.hasVideo && (
                    <div 
                      className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setPlayingVideo(testimonial.id)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Play className="size-12 text-white group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Watch Story
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-300 mb-6">
            Join 500+ sales managers who transformed their teams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              Start Your Success Story
            </button>
            <button className="border border-gray-400 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              Read More Stories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 