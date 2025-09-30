import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  Timeline,
  EmojiEmotions,
  CheckCircle,
  Lightbulb
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    recentMood: null,
    moodTrend: [],
    todaysLog: null,
    recommendations: null,
    prediction: null,
    analytics: null,
    streakInfo: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple data sources
      const [
        logsResponse,
        analyticsResponse,
        recommendationsResponse,
        predictionResponse
      ] = await Promise.all([
        api.get('/api/logs?limit=7'),
        api.get('/api/logs/analytics/mood?days=30'),
        api.get('/api/chat/recommendations'),
        api.get('/api/chat/predict-mood')
      ]);

      const logs = logsResponse.data.logs;
      const analytics = analyticsResponse.data.analytics;
      const recommendations = recommendationsResponse.data;
      const prediction = predictionResponse.data.prediction;

      // Process mood trend data for chart
      const moodTrend = logs.map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: log.mood.score,
        description: log.mood.description
      })).reverse();

      setDashboardData({
        recentMood: logs[0]?.mood,
        moodTrend,
        todaysLog: logs.find(log => 
          new Date(log.date).toDateString() === new Date().toDateString()
        ),
        recommendations,
        prediction,
        analytics,
        streakInfo: {
          current: logs.length,
          total: analytics.totalEntries
        }
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (score) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#ff9800';
    if (score >= 4) return '#ff5722';
    return '#f44336';
  };

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    return '😞';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.profile?.firstName || user?.username}! 👋
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current Mood Status */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEmotions color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Current Mood</Typography>
              </Box>
              {dashboardData.recentMood ? (
                <Box>
                  <Typography variant="h3" sx={{ color: getMoodColor(dashboardData.recentMood.score) }}>
                    {dashboardData.recentMood.score}/10
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {getMoodEmoji(dashboardData.recentMood.score)} {dashboardData.recentMood.description}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No mood data today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Prediction */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tomorrow's Prediction</Typography>
              </Box>
              {dashboardData.prediction?.predictedMood ? (
                <Box>
                  <Typography variant="h3" sx={{ color: getMoodColor(dashboardData.prediction.predictedMood) }}>
                    {dashboardData.prediction.predictedMood}/10
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(dashboardData.prediction.confidence * 100)}% confidence
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Need more data for prediction
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">30-Day Average</Typography>
              </Box>
              {dashboardData.analytics ? (
                <Box>
                  <Typography variant="h3" sx={{ color: getMoodColor(dashboardData.analytics.averageMood) }}>
                    {dashboardData.analytics.averageMood}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.analytics.totalEntries} entries
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No analytics data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Logging Streak */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Logging Streak</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {dashboardData.streakInfo?.current || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                days in a row
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Trend (Last 7 Days)
              </Typography>
              {dashboardData.moodTrend.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.moodTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 10]} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}/10 (${props.payload.description})`,
                          'Mood'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start logging your mood to see trends
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Recommendations */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Recommendations
              </Typography>
              
              {!dashboardData.todaysLog && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => window.location.href = '/log'}
                  >
                    Log Today's Mood
                  </Button>
                </Alert>
              )}

              {dashboardData.recommendations?.recommendations ? (
                <Box>
                  {/* Habit Recommendations */}
                  {dashboardData.recommendations.recommendations.habits?.slice(0, 1).map((rec, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle color="success" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="subtitle2">{rec.title}</Typography>
                      </Box>
                      <List dense>
                        {rec.habits?.slice(0, 2).map((habit, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={typeof habit === 'string' ? habit : habit.name}
                              secondary={typeof habit === 'object' ? habit.suggestion : null}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}

                  {/* Insights */}
                  {dashboardData.recommendations.analysis?.insights?.slice(0, 2).map((insight, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Lightbulb color="warning" sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                        <Typography variant="body2">
                          {insight.message}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Log more entries to get personalized recommendations
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Status */}
        {dashboardData.todaysLog && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Progress
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Mood: {dashboardData.todaysLog.mood.score}/10
                    </Typography>
                    <Chip 
                      label={dashboardData.todaysLog.mood.description}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Habits Completed
                    </Typography>
                    <Typography variant="body1">
                      {dashboardData.todaysLog.habits.filter(h => h.completed).length} / {dashboardData.todaysLog.habits.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Activities Logged
                    </Typography>
                    <Typography variant="body1">
                      {dashboardData.todaysLog.activities.length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;