import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  occupancy: {
    zones: [],
    total: { current: 0, capacity: 0 },
    lastUpdated: null,
  },
  trafficFlow: {
    currentFlow: 0,
    avgSpeed: 0,
    congestionLevel: 0,
    flowChange: 0,
    speedChange: 0,
    congestionChange: 0,
    hourlyData: [],
    lastUpdated: null,
  },
  safetyMonitor: {
    status: 'normal',
    stats: {
      violations: 0,
      warnings: 0,
      compliant: 0,
    },
    recentEvents: [],
    lastUpdated: null,
  },
  analytics: {
    detectionRate: 0,
    accuracy: 0,
    processingTime: 0,
    objectsDetected: 0,
    timeSeriesData: [],
    lastUpdated: null,
  },
  classroom: {
    classrooms: [],
    averages: {
      attention: 0,
      activity: 0,
      occupancy: 0
    },
    lastUpdated: null,
  },
  equipment: {
    equipment: [],
    summary: {
      total: 0,
      active: 0,
      warning: 0,
      critical: 0
    },
    alerts: [],
    lastUpdated: null,
  },
};

const widgetDataSlice = createSlice({
  name: 'widgetData',
  initialState,
  reducers: {
    updateOccupancyData: (state, action) => {
      state.occupancy = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    updateTrafficFlowData: (state, action) => {
      state.trafficFlow = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    updateSafetyData: (state, action) => {
      state.safetyMonitor = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    updateAnalyticsData: (state, action) => {
      state.analytics = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    updateClassroomData: (state, action) => {
      state.classroom = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    updateEquipmentData: (state, action) => {
      state.equipment = {
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    addSafetyEvent: (state, action) => {
      state.safetyMonitor.recentEvents.unshift(action.payload);
      if (state.safetyMonitor.recentEvents.length > 10) {
        state.safetyMonitor.recentEvents.pop();
      }
    },
    addTrafficDataPoint: (state, action) => {
      state.trafficFlow.hourlyData.push(action.payload);
      if (state.trafficFlow.hourlyData.length > 24) {
        state.trafficFlow.hourlyData.shift();
      }
    },
    addEquipmentAlert: (state, action) => {
      state.equipment.alerts.unshift(action.payload);
      if (state.equipment.alerts.length > 50) {
        state.equipment.alerts.pop();
      }
    },
  },
});

export const {
  updateOccupancyData,
  updateTrafficFlowData,
  updateSafetyData,
  updateAnalyticsData,
  updateClassroomData,
  updateEquipmentData,
  addSafetyEvent,
  addTrafficDataPoint,
  addEquipmentAlert,
} = widgetDataSlice.actions;

export default widgetDataSlice.reducer;
