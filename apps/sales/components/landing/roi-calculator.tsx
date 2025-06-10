"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function ROICalculatorSection() {
  const [reps, setReps] = useState([5]);
  const [avgDeal, setAvgDeal] = useState([5000]);
  const [closeRate, setCloseRate] = useState([20]);
  const [reviewHours, setReviewHours] = useState([10]);

  // Calculations
  const monthlyDeals = (reps[0] * 20 * closeRate[0]) / 100; // 20 calls per rep per week
  const monthlyRevenue = monthlyDeals * avgDeal[0];
  const improvedCloseRate = closeRate[0] * 1.1; // 10% improvement
  const improvedDeals = (reps[0] * 20 * improvedCloseRate) / 100;
  const improvedRevenue = improvedDeals * avgDeal[0];
  const additionalRevenue = improvedRevenue - monthlyRevenue;
  const timeReclaimed = reviewHours[0] * 4; // 4 weeks per month
  const timeCostSaved = timeReclaimed * 50; // $50/hour manager time
  const totalMonthlyROI = additionalRevenue + timeCostSaved;
  const annualROI = totalMonthlyROI * 12;
  const toolCost = reps[0] * 27; // $27 per seat
  const netROI = totalMonthlyROI - toolCost;
  const roiMultiple = Math.round(netROI / toolCost);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Calculator className="size-4" />
            Reality Check
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What's The Cost of 
            <span className="text-red-600 dark:text-red-400"> Not Knowing?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Every day without insights is revenue walking out the door. 
            Calculate your hidden costs below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Calculator Inputs */}
          <div className="space-y-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-gray-900 dark:text-white">
                  Your Current Situation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Number of Sales Reps: {reps[0]}
                  </label>
                  <Slider
                    value={reps}
                    onValueChange={setReps}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Average Deal Size: ${avgDeal[0].toLocaleString()}
                  </label>
                  <Slider
                    value={avgDeal}
                    onValueChange={setAvgDeal}
                    max={50000}
                    min={1000}
                    step={500}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Current Close Rate: {closeRate[0]}%
                  </label>
                  <Slider
                    value={closeRate}
                    onValueChange={setCloseRate}
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Hours/Week Reviewing Calls: {reviewHours[0]}
                  </label>
                  <Slider
                    value={reviewHours}
                    onValueChange={setReviewHours}
                    max={40}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={`${reps[0]}-${avgDeal[0]}-${closeRate[0]}-${reviewHours[0]}`}
              className="space-y-4"
            >
              {/* Current Performance */}
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="size-6 text-red-500" />
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
                      Revenue at Risk
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Monthly Revenue Lost</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ${Math.round(additionalRevenue).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Time Wasted</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {timeReclaimed}h/mo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Potential Gains */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="size-6 text-green-500" />
                    <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
                      With AI Insights (10% Improvement)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Additional Revenue</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        +${Math.round(additionalRevenue).toLocaleString()}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Time Reclaimed</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(timeReclaimed * 0.8)}h/mo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROI Summary */}
              <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <DollarSign className="size-8 text-blue-500" />
                      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        ROI Calculator
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Tool Cost:</span>
                        <span className="font-semibold">${toolCost}/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Benefit:</span>
                        <span className="font-semibold text-green-600">+${Math.round(totalMonthlyROI).toLocaleString()}</span>
                      </div>
                      <hr className="border-gray-300 dark:border-gray-600" />
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Net Monthly ROI:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ${Math.round(netROI).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mt-4">
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {roiMultiple}x Return on Investment
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          This pays for itself by preventing just one lost deal per month
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="text-center">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold">
                Start Reclaiming This Revenue Today
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                14-day free trial • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 