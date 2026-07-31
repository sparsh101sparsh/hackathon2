'use client';

import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import {
  Play,
  Send,
  RotateCcw,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Loader2,
  Code2,
  Sparkles,
  Brain,
} from 'lucide-react';
import { ExecuteApiResponse, SubmissionApiResponse, TestCaseResult } from '@/lib/types';
import CodeReviewModal from '@/components/guidance/CodeReviewModal';
import { useAuth } from '@/context/AuthContext';

interface CodeTemplateItem {
  id?: string;
  language: string;
  code: string;
}

interface SampleTestCaseItem {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string | null;
}

interface EditorWorkspaceProps {
  problemId?: string;
  problemTitle?: string;
  problemStatement?: string;
  codeTemplates?: CodeTemplateItem[];
  sampleTestCases?: SampleTestCaseItem[];
  onSubmissionSuccess?: () => void;
}

const LANGUAGES = [
  { id: 'python', label: 'Python 3', defaultCode: 'import sys\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()' },
  { id: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}' },
  { id: 'javascript', label: 'JavaScript', defaultCode: 'const fs = require("fs");\n\nfunction main() {\n}\n\nmain();' },
  { id: 'java', label: 'Java', defaultCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}' },
  { id: 'go', label: 'Go', defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n}' },
];

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  problemId,
  problemTitle = 'DSA Problem',
  problemStatement = '',
  codeTemplates = [],
  sampleTestCases = [],
  onSubmissionSuccess,
}) => {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('cpp');
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'testcases' | 'results' | 'custom'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [executeResult, setExecuteResult] = useState<ExecuteApiResponse | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionApiResponse | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Initialize code when language or templates change
  useEffect(() => {
    const tmpl = codeTemplates.find(
      (t) => t.language.toLowerCase() === selectedLanguage.toLowerCase()
    );
    if (tmpl) {
      setCode(tmpl.code);
    } else {
      const langConfig = LANGUAGES.find((l) => l.id === selectedLanguage);
      setCode(langConfig ? langConfig.defaultCode : '');
    }
  }, [selectedLanguage, codeTemplates]);

  // Set default custom input from sample test case
  useEffect(() => {
    if (sampleTestCases.length > 0 && !customInput) {
      setCustomInput(sampleTestCases[0].input);
    }
  }, [sampleTestCases, customInput]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
  };

  const handleResetCode = () => {
    const tmpl = codeTemplates.find(
      (t) => t.language.toLowerCase() === selectedLanguage.toLowerCase()
    );
    if (tmpl) {
      setCode(tmpl.code);
    } else {
      const langConfig = LANGUAGES.find((l) => l.id === selectedLanguage);
      setCode(langConfig ? langConfig.defaultCode : '');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('results');
    setSubmissionResult(null);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          language: selectedLanguage,
          code,
          customInput: useCustomInput ? customInput : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setExecuteResult(data);
      } else {
        setExecuteResult({
          verdict: 'Runtime Error',
          stdout: '',
          stderr: data.error || 'Execution failed',
          executionTime: 0,
          memory: 0,
        });
      }
    } catch (err: unknown) {
      setExecuteResult({
        verdict: 'Runtime Error',
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Execution error',
        executionTime: 0,
        memory: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problemId) {
      handleRunCode();
      return;
    }

    if (!user) {
      setSubmissionResult({
        verdict: 'Runtime Error',
        passedCount: 0,
        totalCount: 0,
        executionTime: 0,
        memory: 0,
        testResults: [],
        failedTestCase: { input: '', expectedOutput: '', actualOutput: '', error: 'Sign in to save submissions and progress.' },
      });
      setActiveTab('results');
      return;
    }

    setIsSubmitting(true);
    setActiveTab('results');
    setExecuteResult(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problemId,
          language: selectedLanguage,
          code,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmissionResult(data);
        if (data.verdict === 'Accepted' && onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        setSubmissionResult({
          verdict: 'Runtime Error',
          passedCount: 0,
          totalCount: 0,
          executionTime: 0,
          memory: 0,
          testResults: [],
          failedTestCase: {
            input: '',
            expectedOutput: '',
            actualOutput: '',
            error: data.error || 'Submission failed',
          },
        });
      }
    } catch (err: unknown) {
      setSubmissionResult({
        verdict: 'Runtime Error',
        passedCount: 0,
        totalCount: 0,
        executionTime: 0,
        memory: 0,
        testResults: [],
        failedTestCase: {
          input: '',
          expectedOutput: '',
          actualOutput: '',
          error: err instanceof Error ? err.message : 'Submission error',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentVerdict = submissionResult?.verdict || executeResult?.verdict;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Bar / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 backdrop-blur-sm">
        {/* Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Language:</span>
          </div>
          <select
            aria-label="Programming language"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCode}
            title="Reset code to default template"
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            title="Get a code review"
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code Review</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative min-h-[300px]">
        <CodeEditor
          language={selectedLanguage}
          value={code}
          onChange={(val) => setCode(val)}
          onRun={handleRunCode}
          onSubmit={handleSubmitCode}
        />
      </div>

      {/* Bottom Panel (Test Cases & Results) */}
      <div className="h-64 flex flex-col bg-slate-950 border-t border-slate-800">
        {/* Panel Tabs Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'testcases'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Testcases</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Custom Input</span>
              {useCustomInput && (
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Test Results</span>
              {currentVerdict && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                    currentVerdict === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {currentVerdict}
                </span>
              )}
            </button>
          </div>

          {/* Quick Info / Shortcut Hint */}
          <div className="text-[11px] text-slate-500 hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
              Cmd/Ctrl + Enter
            </kbd>{' '}
            Run |{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
              Cmd/Ctrl + Shift + Enter
            </kbd>{' '}
            Submit
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
          {/* TAB 1: Sample Testcases */}
          {activeTab === 'testcases' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {sampleTestCases.map((tc, idx) => (
                  <button
                    key={tc.id || idx}
                    onClick={() => setSelectedTestCaseIndex(idx)}
                    className={`px-3 py-1 text-xs rounded-md border transition ${
                      selectedTestCaseIndex === idx
                        ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>

              {sampleTestCases.length > 0 && (
                <div className="space-y-2">
                  <div>
                    <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">
                      Input:
                    </div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 overflow-x-auto">
                      {sampleTestCases[selectedTestCaseIndex]?.input}
                    </pre>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">
                      Expected Output:
                    </div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-md text-emerald-400 overflow-x-auto">
                      {sampleTestCases[selectedTestCaseIndex]?.expectedOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Custom Input */}
          {activeTab === 'custom' && (
            <div className="space-y-2 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-xs font-sans font-semibold flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useCustomInput}
                    onChange={(e) => setUseCustomInput(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Enable Custom Input for Execution</span>
                </label>
              </div>

              <textarea
                aria-label="Custom standard input"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setUseCustomInput(true);
                }}
                placeholder="Enter custom input standard input (stdin)..."
                rows={4}
                className="w-full flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none font-mono text-xs"
              />
            </div>
          )}

          {/* TAB 3: Results Panel */}
          {activeTab === 'results' && (
            <div className="space-y-3">
              {isRunning || isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs font-sans">
                    {isSubmitting ? 'Evaluating against all test cases...' : 'Executing code...'}
                  </span>
                </div>
              ) : submissionResult ? (
                /* Submission Result Display */
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      {submissionResult.verdict === 'Accepted' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <div>
                        <div
                          className={`text-sm font-bold font-sans ${
                            submissionResult.verdict === 'Accepted'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {submissionResult.verdict}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          Passed {submissionResult.passedCount} / {submissionResult.totalCount} test cases
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{submissionResult.executionTime}s</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>{submissionResult.memory} MB</span>
                      </div>
                    </div>
                  </div>

                  {submissionResult.learning && (
                    <div className="flex items-start gap-2 p-3 bg-cyan-950/25 border border-cyan-800/50 rounded-lg">
                      <Brain className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div className="text-[11px] text-cyan-100/85 font-sans">
                        <span className="font-bold text-cyan-300">Revision Deck updated.</span>{' '}
                        This {submissionResult.learning.pattern} mistake is due for review now and will be shown with the failing case.
                      </div>
                    </div>
                  )}

                  {submissionResult.failedTestCase && (
                    <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg space-y-2">
                      <div className="text-xs font-bold text-rose-400 font-sans">
                        Failed Test Case Details:
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px] font-sans">Input:</div>
                        <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200 text-xs overflow-x-auto">
                          {submissionResult.failedTestCase.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px] font-sans">Expected Output:</div>
                        <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 text-xs overflow-x-auto">
                          {submissionResult.failedTestCase.expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px] font-sans">Actual Output:</div>
                        <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-rose-300 text-xs overflow-x-auto">
                          {submissionResult.failedTestCase.actualOutput || submissionResult.failedTestCase.error}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : executeResult ? (
                /* Run Code Execution Result Display */
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      {executeResult.verdict === 'Accepted' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <div>
                        <div
                          className={`text-sm font-bold font-sans ${
                            executeResult.verdict === 'Accepted'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {executeResult.verdict}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          Custom Run Execution
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{executeResult.executionTime}s</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>{executeResult.memory} MB</span>
                      </div>
                    </div>
                  </div>

                  {executeResult.stdout && (
                    <div>
                      <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">
                        Standard Output (stdout):
                      </div>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-md text-emerald-400 overflow-x-auto">
                        {executeResult.stdout}
                      </pre>
                    </div>
                  )}

                  {executeResult.stderr && (
                    <div>
                      <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold text-rose-400">
                        Standard Error (stderr):
                      </div>
                      <pre className="p-2.5 bg-slate-900 border border-rose-900/50 rounded-md text-rose-300 overflow-x-auto">
                        {executeResult.stderr}
                      </pre>
                    </div>
                  )}

                  {executeResult.testResults && executeResult.testResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-slate-300 text-xs font-semibold font-sans">
                        Sample Test Case Results:
                      </div>
                      {executeResult.testResults.map((tr, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-md border text-xs font-mono ${
                            tr.passed
                              ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300'
                              : 'bg-rose-950/10 border-rose-900/40 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 font-sans font-medium">
                            <span>Case {idx + 1}</span>
                            <span>{tr.passed ? ' Passed' : ' Failed'}</span>
                          </div>
                          <div>Expected: {tr.expectedOutput}</div>
                          <div>Actual: {tr.actualOutput}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 font-sans text-xs">
                  Run your code or submit to see detailed output and verdicts.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code review modal */}
      <CodeReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        problemId={problemId}
        problemTitle={problemTitle}
        problemStatement={problemStatement}
        userCode={code}
        language={selectedLanguage}
        verdict={currentVerdict || 'Accepted'}
      />
    </div>
  );
};

export default EditorWorkspace;
