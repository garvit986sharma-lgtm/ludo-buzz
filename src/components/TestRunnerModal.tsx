/**
 * LUDO BUZZ - In-App Unit Test Suite Runner Modal
 * Runs the comprehensive 8-category test suite directly in the browser.
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Play, RefreshCw, CheckCheck, Terminal } from 'lucide-react';
import { runTestSuite, TestResult } from '../game/__tests__/ludo.test';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runTestSuite();
      setResults(res);
      setIsRunning(false);
      setHasRun(true);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && !hasRun) {
      handleRun();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0).toFixed(1);

  // Group by category
  const categories = Array.from(new Set(results.map((r) => r.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-black tracking-tight">Ludo Logic Unit Test Runner</h2>
              <p className="text-[11px] text-slate-400">Verifying all 8 core game rule categories</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Re-run Tests
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {passedCount} Passed
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-red-600">
                <XCircle className="w-4 h-4 text-red-600" />
                {failedCount} Failed
              </span>
            )}
            <span className="text-slate-500">Total: {results.length} tests</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">{totalDuration}ms total</span>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isRunning ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-slate-400" />
              <div className="text-sm font-semibold">Running test suite...</div>
            </div>
          ) : (
            categories.map((cat) => {
              const catTests = results.filter((r) => r.category === cat);
              return (
                <div key={cat} className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {cat}
                  </h3>
                  <div className="space-y-1 bg-slate-50 rounded-xl p-2 border border-slate-200">
                    {catTests.map((t) => (
                      <div
                        key={t.name}
                        className={`flex items-start justify-between p-2 rounded-lg text-xs ${
                          t.passed ? 'bg-white text-slate-800' : 'bg-red-50 text-red-900 border border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 pr-2">
                          {t.passed ? (
                            <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-semibold">{t.name}</div>
                            {t.error && (
                              <div className="text-red-600 font-mono text-[11px] mt-1 bg-red-100 p-1.5 rounded-md">
                                {t.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">
                          {t.durationMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
