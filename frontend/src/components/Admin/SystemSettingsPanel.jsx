import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Save, RefreshCw, Shield, Mail, Bell, 
  Database, Globe, Lock, Eye, Monitor, AlertCircle
} from 'lucide-react';
import { useThemeContext } from '../../context/themeContext';
import toast from 'react-hot-toast';

const SystemSettingsPanel = () => {
  const { isDark } = useThemeContext();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // System
    siteName: 'Proctolearn',
    siteUrl: 'https://proctolearn.com',
    maintenanceMode: false,
    
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorAuth: false,
    
    // Email
    emailVerificationRequired: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFrom: 'noreply@proctolearn.com',
    
    // Proctoring
    defaultFullscreenRequired: true,
    defaultWebcamRequired: false,
    defaultMicRequired: false,
    allowTabSwitching: false,
    maxTabSwitches: 3,
    
    // Quiz Defaults
    defaultQuizDuration: 60,
    defaultAttempts: 1,
    showCorrectAnswersDefault: true,
    negativeMarkingDefault: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    notifyOnQuizCreation: true,
    notifyOnSubmission: true,
    notifyOnFlaggedActivity: true,
    
    // Storage
    maxFileUploadSize: 10, // MB
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.png',
    storageQuota: 1000 // MB
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to defaults
      toast.info('Settings reset to defaults');
    }
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className={`p-6 rounded-xl border-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const TextInput = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 rounded-lg border ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500' 
            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
    </div>
  );

  const ToggleSwitch = ({ label, checked, onChange, description }) => (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </label>
        {description && (
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );

  const NumberInput = ({ label, value, onChange, min, max, unit }) => (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          min={min}
          max={max}
          className={`flex-1 p-3 rounded-lg border ${
            isDark 
              ? 'bg-slate-900 border-slate-700 text-slate-200' 
              : 'bg-white border-slate-300 text-slate-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {unit && (
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            System Settings
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure system-wide settings and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General */}
        <SettingSection title="General Settings" icon={Settings}>
          <TextInput
            label="Site Name"
            value={settings.siteName}
            onChange={(val) => handleChange('siteName', val)}
          />
          <TextInput
            label="Site URL"
            value={settings.siteUrl}
            onChange={(val) => handleChange('siteUrl', val)}
            type="url"
          />
          <ToggleSwitch
            label="Maintenance Mode"
            checked={settings.maintenanceMode}
            onChange={(val) => handleChange('maintenanceMode', val)}
            description="When enabled, only admins can access the system"
          />
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security Settings" icon={Shield}>
          <NumberInput
            label="Session Timeout"
            value={settings.sessionTimeout}
            onChange={(val) => handleChange('sessionTimeout', val)}
            min={5}
            max={120}
            unit="minutes"
          />
          <NumberInput
            label="Max Login Attempts"
            value={settings.maxLoginAttempts}
            onChange={(val) => handleChange('maxLoginAttempts', val)}
            min={3}
            max={10}
            unit="attempts"
          />
          <NumberInput
            label="Password Min Length"
            value={settings.passwordMinLength}
            onChange={(val) => handleChange('passwordMinLength', val)}
            min={6}
            max={20}
            unit="characters"
          />
          <ToggleSwitch
            label="Require Strong Password"
            checked={settings.requireStrongPassword}
            onChange={(val) => handleChange('requireStrongPassword', val)}
            description="Passwords must contain uppercase, lowercase, numbers, and special characters"
          />
          <ToggleSwitch
            label="Two-Factor Authentication"
            checked={settings.twoFactorAuth}
            onChange={(val) => handleChange('twoFactorAuth', val)}
            description="Enable 2FA for all users"
          />
        </SettingSection>

        {/* Email */}
        <SettingSection title="Email Settings" icon={Mail}>
          <ToggleSwitch
            label="Email Verification Required"
            checked={settings.emailVerificationRequired}
            onChange={(val) => handleChange('emailVerificationRequired', val)}
            description="Users must verify email before accessing the system"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="SMTP Host"
              value={settings.smtpHost}
              onChange={(val) => handleChange('smtpHost', val)}
            />
            <NumberInput
              label="SMTP Port"
              value={settings.smtpPort}
              onChange={(val) => handleChange('smtpPort', val)}
              min={1}
              max={65535}
            />
          </div>
          <TextInput
            label="SMTP Username"
            value={settings.smtpUsername}
            onChange={(val) => handleChange('smtpUsername', val)}
          />
          <TextInput
            label="SMTP Password"
            value={settings.smtpPassword}
            onChange={(val) => handleChange('smtpPassword', val)}
            type="password"
          />
          <TextInput
            label="Email From Address"
            value={settings.emailFrom}
            onChange={(val) => handleChange('emailFrom', val)}
            type="email"
          />
        </SettingSection>

        {/* Proctoring */}
        <SettingSection title="Proctoring Defaults" icon={Monitor}>
          <ToggleSwitch
            label="Fullscreen Required"
            checked={settings.defaultFullscreenRequired}
            onChange={(val) => handleChange('defaultFullscreenRequired', val)}
            description="Require fullscreen mode by default for all quizzes"
          />
          <ToggleSwitch
            label="Webcam Required"
            checked={settings.defaultWebcamRequired}
            onChange={(val) => handleChange('defaultWebcamRequired', val)}
            description="Enable webcam proctoring by default"
          />
          <ToggleSwitch
            label="Microphone Required"
            checked={settings.defaultMicRequired}
            onChange={(val) => handleChange('defaultMicRequired', val)}
            description="Enable audio proctoring by default"
          />
          <ToggleSwitch
            label="Allow Tab Switching"
            checked={settings.allowTabSwitching}
            onChange={(val) => handleChange('allowTabSwitching', val)}
            description="Allow students to switch tabs during quiz"
          />
          <NumberInput
            label="Max Tab Switches"
            value={settings.maxTabSwitches}
            onChange={(val) => handleChange('maxTabSwitches', val)}
            min={0}
            max={10}
            unit="switches"
          />
        </SettingSection>

        {/* Quiz Defaults */}
        <SettingSection title="Quiz Default Settings" icon={Database}>
          <NumberInput
            label="Default Duration"
            value={settings.defaultQuizDuration}
            onChange={(val) => handleChange('defaultQuizDuration', val)}
            min={10}
            max={300}
            unit="minutes"
          />
          <NumberInput
            label="Default Attempts"
            value={settings.defaultAttempts}
            onChange={(val) => handleChange('defaultAttempts', val)}
            min={1}
            max={5}
            unit="attempts"
          />
          <ToggleSwitch
            label="Show Correct Answers"
            checked={settings.showCorrectAnswersDefault}
            onChange={(val) => handleChange('showCorrectAnswersDefault', val)}
            description="Show correct answers after quiz completion"
          />
          <ToggleSwitch
            label="Negative Marking"
            checked={settings.negativeMarkingDefault}
            onChange={(val) => handleChange('negativeMarkingDefault', val)}
            description="Enable negative marking by default"
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notification Settings" icon={Bell}>
          <ToggleSwitch
            label="Email Notifications"
            checked={settings.emailNotifications}
            onChange={(val) => handleChange('emailNotifications', val)}
          />
          <ToggleSwitch
            label="Push Notifications"
            checked={settings.pushNotifications}
            onChange={(val) => handleChange('pushNotifications', val)}
          />
          <ToggleSwitch
            label="Notify on Quiz Creation"
            checked={settings.notifyOnQuizCreation}
            onChange={(val) => handleChange('notifyOnQuizCreation', val)}
          />
          <ToggleSwitch
            label="Notify on Submission"
            checked={settings.notifyOnSubmission}
            onChange={(val) => handleChange('notifyOnSubmission', val)}
          />
          <ToggleSwitch
            label="Notify on Flagged Activity"
            checked={settings.notifyOnFlaggedActivity}
            onChange={(val) => handleChange('notifyOnFlaggedActivity', val)}
          />
        </SettingSection>

        {/* Storage */}
        <SettingSection title="Storage Settings" icon={Database}>
          <NumberInput
            label="Max File Upload Size"
            value={settings.maxFileUploadSize}
            onChange={(val) => handleChange('maxFileUploadSize', val)}
            min={1}
            max={100}
            unit="MB"
          />
          <TextInput
            label="Allowed File Types"
            value={settings.allowedFileTypes}
            onChange={(val) => handleChange('allowedFileTypes', val)}
            placeholder=".pdf,.doc,.docx,.jpg,.png"
          />
          <NumberInput
            label="Storage Quota (per institution)"
            value={settings.storageQuota}
            onChange={(val) => handleChange('storageQuota', val)}
            min={100}
            max={10000}
            unit="MB"
          />
        </SettingSection>
      </div>

      {/* Warning Banner */}
      <div className={`p-4 rounded-xl flex items-start gap-3 ${
        isDark ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />
        <div>
          <h4 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
            Important Note
          </h4>
          <p className={`text-sm mt-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
            Changes to system settings will affect all users and institutions. Make sure to test changes 
            in a staging environment before applying to production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPanel;
