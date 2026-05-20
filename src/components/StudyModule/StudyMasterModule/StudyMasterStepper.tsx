"use client";

import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import BasicInfoForm from "./BasicInfoForm";
import VisitConfigForm from "./VisitConfigForm";
import WorkflowForm from "./WorkflowForm";

const steps = [
  { id: "basic", label: "Basic Info", description: "Study name, phase, sponsor", icon: "📄" },
  { id: "visit", label: "Visit Config", description: "Schedules, timepoints", icon: "📅" },
  { id: "workflow", label: "Workflow", description: "Approvals, notifications", icon: "🔁" },
];

export default function StudyMasterStepper() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState("forward");

//   const currentStep = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const next = () => {
    if (!isLast) {
      setDirection("forward");
      setStep(step + 1);
    }
  };

  const back = () => {
    if (!isFirst) {
      setDirection("backward");
      setStep(step - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index !== step) {
      setDirection(index > step ? "forward" : "backward");
      setStep(index);
    }
  };

  return (
    <div className="">
      <Card className="border-0 m-[30px] shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
        {/* Top progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: "var(--dashboard-theme-color)" }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Wizard Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Study Setup Wizard</h2>
            <p className="text-gray-500 text-sm mt-1">
              Follow the steps to create a new study
            </p>
          </div>

          {/* Step Indicators - Wizard style */}
          <div className="relative mb-12">
            <div className="absolute left-0 top-[20px] w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
            <div className="relative z-10 flex justify-between items-center">
              {steps.map((s, idx) => {
                const isActive = idx === step;
                const isCompleted = idx < step;

                return (
                  <button
                    key={s.id}
                    onClick={() => goToStep(idx)}
                    className="group flex flex-col items-start flex-1 focus:outline-none"
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                        transition-all duration-300
                        ${
                          isActive
                            ? "themeColor shadow-lg scale-110"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }
                      `}
                      style={
                        isActive
                          ? { background: "var(--dashboard-theme-color)", color: "white" }
                          : isCompleted
                          ? { backgroundColor: "#10b981" }
                          : {}
                      }
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium hidden md:block ${
                        isActive ? "themeColor-text" : "text-gray-500"
                      }`}
                      style={isActive ? { color: "var(--dashboard-theme-color)" } : {}}
                    >
                      {s.label}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5 hidden md:block">
                      {s.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Form Container */}
          <div className="min-h-[380px] overflow-hidden">
            <div
              key={step}
              className={`animate-${
                direction === "forward" ? "slideInRight" : "slideInLeft"
              }`}
            >
              {step === 0 && <BasicInfoForm setFormData={setFormData} />}
              {step === 1 && <VisitConfigForm setFormData={setFormData} />}
              {step === 2 && <WorkflowForm setFormData={setFormData} />}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={back}
              disabled={isFirst}
              className="px-8 rounded-full transition-all disabled:opacity-40"
            >
              ← Back
            </Button>

            <div className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Step {step + 1} of {steps.length}
            </div>

            {!isLast ? (
              <Button
                onClick={next}
                className="px-8 rounded-full transition-all hover:shadow-lg"
                style={{ background: "var(--dashboard-theme-color)" }}
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={() => console.log("Final Data:", formData)}
                className="px-8 rounded-full transition-all hover:scale-105"
                style={{ background: "var(--dashboard-theme-color)" }}
              >
                🚀 Create Study
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
      `}</style> */}
    </div>
  );
}