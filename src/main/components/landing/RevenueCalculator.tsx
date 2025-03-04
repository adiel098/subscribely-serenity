
import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const RevenueCalculator = () => {
  const [subscribers, setSubscribers] = useState(250);
  const [price, setPrice] = useState(45);
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [revenue, setRevenue] = useState('$11.25K');

  useEffect(() => {
    // Calculate revenue based on inputs
    const monthlyRevenue = subscribers * price;
    const formattedRevenue = monthlyRevenue >= 1000 
      ? `$${(monthlyRevenue / 1000).toFixed(2)}K` 
      : `$${monthlyRevenue}`;
    
    setRevenue(formattedRevenue);
  }, [subscribers, price]);

  return (
    <section className="py-20 px-4 sm:px-8 lg:px-16 bg-indigo-50 w-full">
      <div className="container-fluid mx-auto max-w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-5/12"
          >
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle className="text-2xl font-bold text-indigo-900">
                  Estimate what you could make on Membify
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="subscribers" className="text-sm font-medium text-indigo-800">
                    Enter number of subscribers
                  </label>
                  <Input
                    id="subscribers"
                    type="number"
                    value={subscribers}
                    onChange={(e) => setSubscribers(parseInt(e.target.value) || 0)}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label htmlFor="price" className="text-sm font-medium text-indigo-800">
                      Enter Price
                    </label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cycle" className="text-sm font-medium text-indigo-800">
                      Cycle
                    </label>
                    <select
                      id="cycle"
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                </div>
                
                <div className="border-t border-purple-100 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-indigo-800">You receive:</span>
                    <span className="text-3xl font-bold text-indigo-900">
                      {revenue}
                      <span className="text-sm font-normal text-indigo-600">/{billingCycle.toLowerCase()}</span>
                    </span>
                  </div>
                </div>
                
                <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Get started
                </Button>
                
                <p className="text-center text-xs text-indigo-500">
                  You keep all revenue after any applicable Membify and Stripe fees.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-6/12 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
              Start earning from your community in a few clicks. 💰
            </h2>
            
            <p className="text-lg text-indigo-700">
              Membify is the easiest way to charge for access to your Telegram community. Create your account in minutes and start earning money for the value you offer.
            </p>
            
            <div className="pt-6">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/auth">
                  Start Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
