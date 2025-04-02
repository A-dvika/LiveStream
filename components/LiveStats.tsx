import React, { useState, useMemo } from 'react';

// 1) Import Chart.js + react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

type StatEntry = {
  timestamp: string;
  emotion: string;
  eye_state: string;
  looking_direction: string;
  engagement: string;
  participant: string;
};

type LiveStatsProps = {
  emotionData: StatEntry[];
  onClose: () => void;
};

enum FocusScore {
  'Not Focused' = 0,
  Neutral = 1,
  Focused = 2,
}

/**
 * Converts an engagement string (e.g., "Focused", "Not Focused", "Neutral")
 * into a numeric value for line-chart plotting.
 */
function engagementToNumeric(engagement: string): number {
  if (engagement === 'Focused') return FocusScore.Focused;
  if (engagement === 'Neutral') return FocusScore.Neutral;
  return FocusScore['Not Focused'];
}

const LiveStats: React.FC<LiveStatsProps> = ({ emotionData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'emotionDist' | 'engagementDist' | 'engagementOverTime'>('table');

  /** ====================== Data Transformations ====================== **/

  // Frequency count of each emotion (for the bar chart)
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of emotionData) {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    }
    return counts;
  }, [emotionData]);

  // Frequency count of each engagement (for the pie chart)
  const engagementCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of emotionData) {
      counts[entry.engagement] = (counts[entry.engagement] || 0) + 1;
    }
    return counts;
  }, [emotionData]);

  // Engagement Over Time (line chart)
  // Sort entries by timestamp, then create arrays of x-values (index or time) and y-values (FocusScore).
  const sortedEntries = useMemo(() => {
    return [...emotionData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }, [emotionData]);

  // For each entry in chronological order, we plot engagement as a numeric value.
  const lineChartLabels = sortedEntries.map((_, i) => `Data #${i + 1}`);
  const lineChartDataValues = sortedEntries.map((entry) => engagementToNumeric(entry.engagement));

  /** ====================== Chart Configs ====================== **/

  // Emotion distribution (Bar chart)
  const emotionDistData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: 'Emotion Count',
        data: Object.values(emotionCounts),
      },
    ],
  };

  // Engagement distribution (Pie chart)
  const engagementDistData = {
    labels: Object.keys(engagementCounts),
    datasets: [
      {
        label: 'Engagement Count',
        data: Object.values(engagementCounts),
      },
    ],
  };

  // Engagement over time (Line chart)
  const engagementLineData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Engagement (Focused=2, Neutral=1, Not Focused=0)',
        data: lineChartDataValues,
      },
    ],
  };

  /** ====================== Download Handlers ====================== **/

  // Download data as CSV
  const handleDownloadCSV = () => {
    // Create CSV header
    const headers = ['timestamp', 'participant', 'emotion', 'eye_state', 'looking_direction', 'engagement'];
    const csvRows = [headers.join(',')];

    // Populate rows
    for (const entry of emotionData) {
      const row = [
        new Date(entry.timestamp).toISOString(),
        entry.participant,
        entry.emotion,
        entry.eye_state,
        entry.looking_direction,
        entry.engagement,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'engagement_stats.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  // Download data as JSON
  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(emotionData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'engagement_stats.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: '#000', // <--- Force text color black
    }}
  >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: '80vh',
          overflowY: 'auto',
          width: '90%',
          maxWidth: '900px',
          position: 'relative',
        }}
      >
        <h2>Live Engagement Stats</h2>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {/* ---- Navigation Tabs ---- */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => setActiveTab('table')}
          >
            Table
          </button>
          <button
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => setActiveTab('emotionDist')}
          >
            Emotion Dist
          </button>
          <button
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => setActiveTab('engagementDist')}
          >
            Engagement Dist
          </button>
          <button
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => setActiveTab('engagementOverTime')}
          >
            Engagement Over Time
          </button>
        </div>

        {/* ---- Download Buttons ---- */}
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={handleDownloadCSV}
            style={{
              padding: '6px 12px',
              marginRight: '10px',
              cursor: 'pointer',
              backgroundColor: '#ffd700',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Download CSV
          </button>
          <button
            onClick={handleDownloadJSON}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              backgroundColor: '#a8e86c',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Download JSON
          </button>
        </div>

        {/* ---- Tab Content ---- */}
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'table' && (
            <TableView emotionData={emotionData} />
          )}

          {activeTab === 'emotionDist' && (
            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <h3>Emotion Distribution</h3>
              <Bar
                data={emotionDistData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Emotion Frequency',
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          )}

          {activeTab === 'engagementDist' && (
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              <h3>Engagement Distribution</h3>
              <Pie
                data={engagementDistData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Engagement Frequency',
                    },
                  },
                }}
              />
            </div>
          )}

          {activeTab === 'engagementOverTime' && (
            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <h3>Engagement Over Time</h3>
              <Line
                data={engagementLineData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      min: 0,
                      max: 2,
                      ticks: {
                        callback: (value) => {
                          // Convert numeric scale back to text
                          switch (value) {
                            case 0:
                              return 'Not Focused';
                            case 1:
                              return 'Neutral';
                            case 2:
                              return 'Focused';
                            default:
                              return value;
                          }
                        },
                      },
                    },
                  },
                  plugins: {
                    title: {
                      display: true,
                      text: 'Engagement Over Time (Focused=2, Neutral=1, Not Focused=0)',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Simple table view for 'table' tab */
const TableView: React.FC<{ emotionData: StatEntry[] }> = ({ emotionData }) => {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
      }}
    >
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Timestamp</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Participant</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Emotion</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Eye State</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Direction</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Engagement</th>
        </tr>
      </thead>
      <tbody>
        {emotionData.map((data, index) => (
          <tr key={index}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {new Date(data.timestamp).toLocaleTimeString()}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.participant}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.emotion}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.eye_state}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.looking_direction}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.engagement}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LiveStats;
