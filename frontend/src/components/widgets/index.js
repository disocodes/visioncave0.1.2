// Core Widgets
export { default as BaseWidget } from './BaseWidget';
export { default as WidgetContainer } from './WidgetContainer';
export { default as CameraStreamWidget } from './CameraStreamWidget';
export { default as AnalyticsDashboardWidget } from './AnalyticsDashboardWidget';
export { default as AlertWidget } from './AlertWidget';
export { default as ZoneManagementWidget } from './ZoneManagementWidget';
export { default as SettingsPanelWidget } from './SettingsPanelWidget';

// Residential Vision Widgets
export { default as PackageDetectionWidget } from './residential/PackageDetectionWidget';
export { default as OccupancyWidget } from './residential/OccupancyWidget';
export { default as SecurityAlertWidget } from './residential/SecurityAlertWidget';

// School Vision Widgets
export { default as StudentAttendanceWidget } from './school/StudentAttendanceWidget';
export { default as PlaygroundSafetyWidget } from './school/PlaygroundSafetyWidget';
export { default as ClassroomActivityWidget } from './school/ClassroomActivityWidget';

// Hospital Vision Widgets
export { default as PatientFallDetectionWidget } from './hospital/PatientFallDetectionWidget';
export { default as EquipmentTrackingWidget } from './hospital/EquipmentTrackingWidget';
export { default as HygieneComplianceWidget } from './hospital/HygieneComplianceWidget';

// Mine Site Vision Widgets
export { default as HeavyMachineryTrackingWidget } from './mine/HeavyMachineryTrackingWidget';
export { default as SafetyGearComplianceWidget } from './mine/SafetyGearComplianceWidget';
export { default as HazardousAreaWidget } from './mine/HazardousAreaWidget';

// Traffic Vision Widgets
export { default as TrafficFlowWidget } from './traffic/TrafficFlowWidget';
export { default as ParkingOccupancyWidget } from './traffic/ParkingOccupancyWidget';
export { default as PublicSafetyWidget } from './traffic/PublicSafetyWidget';
