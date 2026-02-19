import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

type VerificationLevel = "basic" | "advanced" | "expert";

const VerificationPageContent: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<VerificationLevel>("basic");
  const [activeStep, setActiveStep] = useState(1);

  const verificationLevels = [
    {
      level: "basic" as const,
      name: "Basic Verification",
      icon: "✓",
      status: "verified",
      completedDate: "Jan 15, 2026",
      requirements: [
        { name: "Email verification", status: "completed" },
        { name: "Phone verification", status: "completed" },
      ],
    },
    {
      level: "advanced" as const,
      name: "Advanced Verification",
      icon: "⭐",
      status: "pending",
      completedDate: null,
      requirements: [
        { name: "Identity verification", status: "pending" },
        { name: "Address verification", status: "pending" },
        { name: "Documents upload", status: "pending" },
      ],
    },
    {
      level: "expert" as const,
      name: "Expert Verification",
      icon: "👑",
      status: "not-started",
      completedDate: null,
      requirements: [
        { name: "Advanced KYC", status: "not-started" },
        { name: "Business verification", status: "not-started" },
        { name: "Bank details", status: "not-started" },
      ],
    },
  ];

  const advancedSteps = [
    {
      number: 1,
      title: "Identity Verification",
      description: "Upload a valid government-issued ID",
      completed: false,
    },
    {
      number: 2,
      title: "Address Verification",
      description: "Upload a recent utility bill or bank statement",
      completed: false,
    },
    {
      number: 3,
      title: "Selfie Verification",
      description: "Take a selfie with your ID for liveness check",
      completed: false,
    },
    {
      number: 4,
      title: "Review",
      description: "Wait for our team to review your documents",
      completed: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
        <p className="text-gray-600 mt-2">Complete verification levels to increase trading limits</p>
      </div>

      {/* Verification Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {verificationLevels.map((level) => (
          <div
            key={level.level}
            className={`rounded-lg border-2 p-6 transition-all cursor-pointer ${
              currentLevel === level.level
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setCurrentLevel(level.level)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-3xl mb-2 block">{level.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{level.name}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  level.status === "verified"
                    ? "bg-green-100 text-green-700"
                    : level.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {level.status === "verified"
                  ? "✓ Verified"
                  : level.status === "pending"
                    ? "⏳ Pending"
                    : "Not Started"}
              </span>
            </div>

            {/* Completed Date */}
            {level.completedDate && (
              <p className="text-xs text-gray-600 mb-4">
                Verified on {level.completedDate}
              </p>
            )}

            {/* Requirements */}
            <div className="space-y-2">
              {level.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      req.status === "completed"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {req.status === "completed" ? "✓" : "○"}
                  </span>
                  <span className="text-sm text-gray-600">{req.name}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            {currentLevel === level.level && level.status !== "verified" && (
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Continue
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Advanced Verification Steps */}
      {currentLevel === "advanced" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Verification Steps</h2>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {advancedSteps.map((step, idx) => (
              <div key={step.number}>
                <button
                  onClick={() => setActiveStep(step.number)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    activeStep === step.number
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          step.completed
                            ? "bg-green-600"
                            : "bg-gray-400"
                        }`}
                      >
                        {step.completed ? "✓" : step.number}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{step.title}</p>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {step.completed && (
                      <span className="text-green-600 font-bold">Verified</span>
                    )}
                  </div>
                </button>

                {/* Step Content */}
                {activeStep === step.number && !step.completed && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {step.number === 1 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          Please upload a clear photo of your government-issued ID
                          (passport, driver's license, or national ID)
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-gray-600 text-sm">
                            Drag and drop your file here, or click to select
                          </p>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Upload & Continue
                        </button>
                      </div>
                    )}

                    {step.number === 2 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          Please upload a recent utility bill or bank statement
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-gray-600 text-sm">
                            Drag and drop your file here, or click to select
                          </p>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Upload & Continue
                        </button>
                      </div>
                    )}

                    {step.number === 3 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          Please take a clear selfie with your ID for liveness verification
                        </p>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Open Camera
                        </button>
                      </div>
                    )}

                    {step.number === 4 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          Your documents have been submitted for review. We'll verify
                          them within 24-48 hours.
                        </p>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            ⏳ Estimated verification time: 24-48 hours
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Verification Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              level: "Basic",
              limit: "$10,000",
              features: ["Email verified", "Phone verified"],
            },
            {
              level: "Advanced",
              limit: "$100,000",
              features: ["Full KYC", "Higher limits", "Priority support"],
            },
            {
              level: "Expert",
              limit: "Unlimited",
              features: ["Business verified", "Custom limits", "Dedicated manager"],
            },
          ].map((benefit, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 mb-2">{benefit.level}</p>
              <p className="text-lg font-bold text-blue-600 mb-3">
                Trading Limit: {benefit.limit}
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                {benefit.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const VerificationPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:4000/api/dashboard/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
            email: d.email || '',
            isVerified: d.emailVerified
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout user={userProfile || { name: 'User', email: '' }}>
      <VerificationPageContent />
    </DashboardLayout>
  );
};

export default VerificationPage;
