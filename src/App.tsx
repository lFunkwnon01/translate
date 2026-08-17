import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, TranslationJob, UserSettings } from './types';
import { MOCK_JOBS, INITIAL_SETTINGS } from './data/mockData';
import { createNewJob, JobSimulator } from './services/jobService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingScreen } from './components/screens/LandingScreen';
import { TranslateScreen } from './components/screens/TranslateScreen';
import { ProgressScreen } from './components/screens/ProgressScreen';
import { PreviewScreen } from './components/screens/PreviewScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { FlowDiagramModal } from './components/modals/FlowDiagramModal';
import { DashboardScreen, LoginScreen, PlanScreen, RegisterScreen, UsageScreen } from './components/screens/AccountScreens';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [jobs, setJobs] = useState<TranslationJob[]>(MOCK_JOBS);
  const [currentJob, setCurrentJob] = useState<TranslationJob>(MOCK_JOBS[0]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  
  const [isFlowsOpen, setIsFlowsOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Simulator instance ref
  const simulatorRef = useRef<JobSimulator | null>(null);

  // Clean up simulator on unmount
  useEffect(() => {
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, []);

  const handleStartJob = (
    file: { name: string; size: number },
    sourceLang: string,
    targetLang: string,
    scenario: 'normal' | 'ocr_warning' | 'recoverable_error' | 'permanent_error' = 'normal'
  ) => {
    // Stop any existing simulation
    if (simulatorRef.current) {
      simulatorRef.current.stop();
    }

    const newJob = createNewJob(file.name, file.size, sourceLang, targetLang, {
      preserveLayout: settings.preserveLayout,
      glossaryName: settings.defaultGlossary,
      ocrEnabled: settings.autoOcr,
    });

    setCurrentJob(newJob);
    setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== newJob.id)]);
    setActiveTab('progress');

    // Run simulation
    const simulator = new JobSimulator(newJob, {
      scenario,
      speedMs: 1300,
      onUpdate: (updatedJob) => {
        setCurrentJob(updatedJob);
        setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      },
      onComplete: (completedJob) => {
        setCurrentJob(completedJob);
        setJobs((prev) => prev.map((j) => (j.id === completedJob.id ? completedJob : j)));
      },
    });

    simulatorRef.current = simulator;
    simulator.start();
  };

  const openTranslation = () => setActiveTab(userEmail ? 'translate' : 'login');
  const handleAuth = (email: string) => {
    setUserEmail(email);
    setActiveTab('dashboard');
  };
  const handleSignOut = () => {
    setUserEmail('');
    setActiveTab('home');
  };

  const handleCancelCurrentJob = () => {
    if (simulatorRef.current) {
      const cancelledJob = simulatorRef.current.cancel();
      setCurrentJob(cancelledJob);
      setJobs((prev) => prev.map((j) => (j.id === cancelledJob.id ? cancelledJob : j)));
    } else {
      const updated = {
        ...currentJob,
        status: 'cancelled' as const,
        statusMessage: 'Cancelled by user at fragment boundary.',
      };
      setCurrentJob(updated);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    }
  };

  const handleFastForward = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stop();
    }
    const completedJob: TranslationJob = {
      ...currentJob,
      status: 'completed',
      progress: 100,
      statusMessage: 'Translation Complete! Your document is ready for review and download.',
      estimatedTimeRemaining: '0s',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '1m 20s',
      eventLogs: [
        ...currentJob.eventLogs,
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Fast-forward command applied. Quality validation 100% passed.',
          type: 'success',
        },
      ],
    };
    setCurrentJob(completedJob);
    setJobs((prev) => prev.map((j) => (j.id === completedJob.id ? completedJob : j)));
  };

  const handleTriggerOcrWarning = () => {
    const updatedJob: TranslationJob = {
      ...currentJob,
      warnings: [
        ...currentJob.warnings.filter((w) => w.type !== 'ocr_low_confidence'),
        {
          id: 'w_sim_ocr',
          type: 'ocr_low_confidence',
          title: 'Low Confidence OCR',
          description: 'Pages 4 & 12 required approximation due to low-contrast handwritten segments.',
          pages: [4, 12],
          severity: 'medium',
        },
      ],
      eventLogs: [
        ...currentJob.eventLogs,
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Simulated OCR engine: Page 4 scanned note confidence 74%.',
          type: 'warning',
          pageNumber: 4,
        },
      ],
    };
    setCurrentJob(updatedJob);
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleTriggerBackoffRetry = () => {
    const updatedJob: TranslationJob = {
      ...currentJob,
      statusMessage: 'OCI RateLimit 429 encountered — Backoff retry succeeded in 2.1s.',
      eventLogs: [
        ...currentJob.eventLogs,
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Llamada OCI rate limit: iniciada política de backoff y reintento en 2s.',
          type: 'warning',
        },
        {
          id: String(Date.now() + 1),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Reintento exitoso: reanudando traducción desde fragmento 14 sin pérdida de estado.',
          type: 'success',
        },
      ],
    };
    setCurrentJob(updatedJob);
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleViewJob = (job: TranslationJob) => {
    setCurrentJob(job);
    if (job.status === 'completed') {
      setActiveTab('preview');
    } else if (job.status === 'translating' || job.status === 'analyzing' || job.status === 'extracting') {
      setActiveTab('progress');
    } else {
      setActiveTab('preview');
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFlows={() => setIsFlowsOpen(true)}
        onOpenAuth={() => setActiveTab(userEmail ? 'dashboard' : 'login')}
        userEmail={userEmail}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingScreen
            onStartTranslating={openTranslation}
            onSelectSampleJob={(jobId) => {
              const target = jobs.find((j) => j.id === jobId) || jobs[0];
              handleViewJob(target);
            }}
            onOpenFlows={() => setIsFlowsOpen(true)}
          />
        )}

        {activeTab === 'translate' && (
          <TranslateScreen
            recentJobs={jobs}
            onStartJob={handleStartJob}
            onViewJob={handleViewJob}
            onViewAllHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'login' && <LoginScreen onSubmit={handleAuth} onSwitch={() => setActiveTab('register')} />}
        {activeTab === 'register' && <RegisterScreen onSubmit={handleAuth} onSwitch={() => setActiveTab('login')} />}
        {activeTab === 'dashboard' && <DashboardScreen email={userEmail} jobs={jobs} onTranslate={openTranslation} onOpenJob={handleViewJob} onSignOut={handleSignOut} />}
        {activeTab === 'usage' && <UsageScreen />}
        {activeTab === 'plan' && <PlanScreen />}

        {activeTab === 'progress' && (
          <ProgressScreen
            job={currentJob}
            onCancelJob={handleCancelCurrentJob}
            onFastForward={handleFastForward}
            onTriggerOcrWarning={handleTriggerOcrWarning}
            onTriggerBackoffRetry={handleTriggerBackoffRetry}
            onProceedToReview={() => setActiveTab('preview')}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewScreen
            job={currentJob}
            onNewTranslation={() => setActiveTab('translate')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            jobs={jobs}
            onSelectJob={handleViewJob}
            onDeleteJob={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenDocModal={() => setIsFlowsOpen(true)} />

      <FlowDiagramModal
        isOpen={isFlowsOpen}
        onClose={() => setIsFlowsOpen(false)}
      />
    </div>
  );
}
