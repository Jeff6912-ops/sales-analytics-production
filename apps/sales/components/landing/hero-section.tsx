"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PlayIcon } from "@radix-ui/react-icons";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8"
    >
      {/* Trust Bar */}
      <div className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white dark:text-black transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
        <TextShimmer className="inline-flex items-center justify-center">
          <span>🔥 Trusted by 500+ HighLevel Sales Teams</span>{" "}
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>

      {/* Power Headlines */}
      <h1 className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        Stop Flying Blind.
        <br className="hidden md:block" /> 
        <span className="text-red-500 dark:text-red-400">Start Coaching With Confidence.</span>
      </h1>

      <p className="mb-8 text-lg tracking-tight text-gray-400 md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        AI-powered call analysis for HighLevel that turns your 
        <br className="hidden md:block" />
        <span className="text-white dark:text-white font-semibold">847 meaningless calls into actionable coaching insights</span> in seconds.
      </p>

      {/* Dual CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <Button className="gap-1 rounded-lg text-white dark:text-black bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3">
          <span>Start Your 14-Day FREE Trial</span>
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </Button>
        <Button variant="outline" className="gap-2 rounded-lg px-6 py-3">
          <PlayIcon className="size-4" />
          <span>See It In Action</span>
        </Button>
      </div>

      {/* Split Hero Visual */}
      <div
        ref={ref}
        className="relative mt-[4rem] animate-fade-up opacity-0 [--animation-delay:400ms] [perspective:2000px]"
      >
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE: Chaos */}
          <div className="relative">
            <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">Before: Flying Blind</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">847 calls to review manually</span>
                </div>
                <div className="flex items-center gap-3 text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">40+ hours spent guessing</span>
                </div>
                <div className="flex items-center gap-3 text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Top performers quitting</span>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER: Clarity */}
          <div className="relative">
            <div className={`rounded-xl border border-green-500/20 bg-green-900/10 p-6 ${inView ? "before:animate-image-glow" : ""}`}>
              <BorderBeam
                size={200}
                duration={12}
                delay={11}
                colorFrom="#10b981"
                colorTo="#3b82f6"
              />
              <h3 className="text-xl font-bold text-green-400 mb-4">After: AI-Powered Insights</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Every call analyzed instantly</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Actionable coaching insights</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Team performance transformed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 