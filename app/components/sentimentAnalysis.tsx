"use client"

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Use dynamic import for ReactWordcloud since it's client-only
const ReactWordcloud = dynamic(() => import('react-wordcloud'), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Loading wordcloud...</div>
});

interface SentimentData {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overall: string;
    compound: number;
  };
  wordcloud_data: {
    words: Array<{
      text: string;
      value: number;
    }>;
  };
}

interface SentimentAnalysisProps {
  bookId: string;
  onError?: (error: string) => void;
  wordCloudOnly?: boolean;
  hideWordCloud?: boolean;
}

export function SentimentAnalysis({ bookId, onError, wordCloudOnly = false, hideWordCloud = false }: SentimentAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try the API route first
      let response = await fetch(`/api/books/${bookId}/sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      // If the response is not ok, try the direct API call
      if (!response.ok) {
        console.warn("API route failed, trying direct backend access");
        
        // Fallback to direct backend call
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';
        response = await fetch(`${backendUrl}/books/${bookId}/sentiment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });
      }
      
      if (!response.ok) {
        const errorMessage = `Failed to fetch sentiment: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setSentimentData(data);
    } catch (err: any) {
      console.error("Error fetching sentiment:", err);
      const errorMessage = err.message || "Error analyzing book sentiment";
      setError(errorMessage);
      
      // Call the onError callback if provided
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchSentiment();
    }
  }, [bookId]);

  // Options for the wordcloud
  const wordcloudOptions = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    fontSizes: [14, 60] as [number, number],
    padding: 2,
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#22c55e'; // green
      case 'negative':
        return '#ef4444'; // red
      case 'neutral':
        return '#3b82f6'; // blue
      default:
        return '#a855f7'; // purple
    }
  };

  // Render loading state
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg 
                  flex flex-col items-center justify-center space-y-4 min-h-[300px]"
      >
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">
          {wordCloudOnly ? "Analyzing word frequencies..." : "Analyzing book sentiment..."}
        </p>
      </motion.div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-destructive/20 shadow-lg 
                  flex flex-col items-center justify-center space-y-4 min-h-[300px]"
      >
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground text-center">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchSentiment}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Analysis
        </Button>
      </motion.div>
    );
  }

  // Render when no data is available
  if (!sentimentData) {
    return null;
  }

  // If word cloud only view is requested
  if (wordCloudOnly) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-lg font-medium mb-4"
        >
          Word Frequency Cloud
        </motion.h3>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="h-[350px] w-full"
        >
          {sentimentData.wordcloud_data?.words && sentimentData.wordcloud_data.words.length > 0 ? (
            <ReactWordcloud 
              words={sentimentData.wordcloud_data.words} 
              options={wordcloudOptions} 
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No word frequency data available
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Prepare sentiment data for chart
  const sentimentChartData = [
    { name: 'Positive', value: sentimentData.sentiment.positive },
    { name: 'Neutral', value: sentimentData.sentiment.neutral },
    { name: 'Negative', value: sentimentData.sentiment.negative }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-xl font-serif-reading font-semibold relative inline-block"
      >
        Sentiment Analysis
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-primary/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.h2>
      
      {/* Sentiment Overview Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall sentiment */}
          <div className="flex flex-col space-y-4">
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-medium"
            >
              Overall Sentiment: 
              <span 
                className="ml-2 font-semibold capitalize" 
                style={{ color: getSentimentColor(sentimentData.sentiment.overall) }}
              >
                {sentimentData.sentiment.overall}
              </span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground"
            >
              Compound Score: <span className="font-medium">{sentimentData.sentiment.compound.toFixed(2)}</span>
            </motion.p>
          </div>
          
          {/* Sentiment Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="h-[200px]"
          >
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Sentiment Distribution
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    borderRadius: '8px', 
                    borderColor: 'var(--border)',
                    color: 'var(--chart-tooltip-text)'
                  }}
                  cursor={{ fill: 'var(--chart-hover-bg)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="var(--chart-bar)"
                  animationDuration={1500}
                  isAnimationActive={true}
                  activeBar={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Word Cloud - only rendered if hideWordCloud is false */}
      {!hideWordCloud && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg"
        >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-lg font-medium mb-4"
          >
            Word Frequency Cloud
          </motion.h3>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="h-[350px] w-full"
          >
            {sentimentData.wordcloud_data?.words && sentimentData.wordcloud_data.words.length > 0 ? (
              <ReactWordcloud 
                words={sentimentData.wordcloud_data.words} 
                options={wordcloudOptions} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No word frequency data available
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
