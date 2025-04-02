'use client';
import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line 
} from "recharts";

type LiveStatsProps = {
  emotionData: {
    timestamp: string;
    emotion: string;
    participant: string;
    eye_tracking?: number;
    engagement?: string;       // New field for engagement status
    eye_state?: string;
    looking_direction?: string;
  }[];
  onClose: () => void;
};

const EMOTION_COLORS: Record<string, string> = {
  Happy: "#FFD700",
  Sad: "#1E90FF",
  Angry: "#FF4500",
  Neutral: "#A9A9A9",
  Surprised: "#8A2BE2",
  Focused: "#4CAF50",
  "Not Focused": "#F44336",
};

// Returns pie chart data for engagement distribution
const getEngagementPieData = (data: LiveStatsProps["emotionData"]) => {
  const counts = data.reduce((acc, { engagement }) => {
    if (engagement) {
      acc[engagement] = (acc[engagement] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

// Count emotions for Pie Chart
const getPieData = (emotionData: LiveStatsProps["emotionData"]) => {
  const counts = emotionData.reduce((acc, { emotion }) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

// Emotion Trends Over Time
const getTimeData = (emotionData: LiveStatsProps["emotionData"]) =>
  emotionData.map(({ timestamp, emotion }) => ({
    timestamp: new Date(timestamp).toLocaleTimeString(),
    emotion,
  }));

// Eye Tracking Data
const getEyeTrackingData = (emotionData: LiveStatsProps["emotionData"]) =>
  emotionData.map(({ timestamp, eye_tracking = 0 }) => ({
    timestamp: new Date(timestamp).toLocaleTimeString(),
    value: eye_tracking,
  }));

// Emotion by Participant for Bar Chart
const getBarData = (emotionData: LiveStatsProps["emotionData"]) => {
  const participantData = emotionData.reduce((acc, { participant, emotion }) => {
    if (!acc[participant]) {
      acc[participant] = {
        participant,
        ...Object.fromEntries(Object.keys(EMOTION_COLORS).map(e => [e, 0])),
      };
    }
    acc[participant][emotion] = (acc[participant][emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, any>);
  return Object.values(participantData);
};

const LiveStats: React.FC<LiveStatsProps> = ({ emotionData, onClose }) => {
  const [currentGraph, setCurrentGraph] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const graphs = [
    {
      title: "📊 Engagement Distribution",
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={getEngagementPieData(emotionData)}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {getEngagementPieData(emotionData).map((entry, index) => (
                <Cell key={index} fill={EMOTION_COLORS[entry.name] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", color: "#222", borderRadius: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "📊 Emotion Distribution",
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={getPieData(emotionData)}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {getPieData(emotionData).map((entry, index) => (
                <Cell key={index} fill={EMOTION_COLORS[entry.name] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", color: "#222", borderRadius: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "📈 Emotion Trends Over Time",
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getTimeData(emotionData)}>
            <XAxis dataKey="timestamp" tick={{ fill: "#6A1B9A" }} />
            <YAxis dataKey="emotion" type="category" tick={{ fill: "#6A1B9A" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", color: "#222", borderRadius: "8px" }}
            />
            <Line type="monotone" dataKey="emotion" stroke="#FFD700" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "👀 Eye Tracking Over Time",
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getEyeTrackingData(emotionData)}>
            <XAxis dataKey="timestamp" tick={{ fill: "#6A1B9A" }} />
            <YAxis tick={{ fill: "#6A1B9A" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", color: "#222", borderRadius: "8px" }}
            />
            <Line type="monotone" dataKey="value" stroke="#00FFFF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "👥 Emotion by Participant",
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getBarData(emotionData)}>
            <XAxis dataKey="participant" tick={{ fill: "#6A1B9A" }} />
            <YAxis tick={{ fill: "#6A1B9A" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", color: "#222", borderRadius: "8px" }}
            />
            {Object.keys(EMOTION_COLORS).map((emotion) => (
              <Bar key={emotion} dataKey={emotion} stackId="a" fill={EMOTION_COLORS[emotion]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-[600px] max-w-full rounded-xl bg-gradient-to-br from-[#f4e1ff] to-[#fff6b0] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#5a189a]">
            {graphs[currentGraph].title}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-[#5a189a]">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">{graphs[currentGraph].component}</div>

        <div className="flex justify-between">
          <button
            className="text-white bg-[#5a189a] px-4 py-2 rounded-lg hover:bg-[#6b21a8] disabled:opacity-50 flex items-center gap-2"
            onClick={() => setCurrentGraph((prev) => Math.max(0, prev - 1))}
            disabled={currentGraph === 0}
          >
            <ArrowLeft size={20} /> Prev
          </button>
          <button
            className="text-black bg-[#ffdd57] px-4 py-2 rounded-lg hover:bg-[#fcca46] disabled:opacity-50 flex items-center gap-2"
            onClick={() =>
              setCurrentGraph((prev) => Math.min(graphs.length - 1, prev + 1))
            }
            disabled={currentGraph === graphs.length - 1}
          >
            Next <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStats;
