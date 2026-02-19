import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: string;
}

const UpgradePageContent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const plans: Plan[] = [
    {
      id: "mini",
      name: "Mini",
      price: 9.99,
      description: "Perfect for beginners",
      icon: "🚀",
      features: [
        "Up to $5,000 trading limit",
        "Basic market data",
        "Email support",
        "2 active trades",
        "Basic analytics",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: 29.99,
      description: "For regular traders",
      icon: "⭐",
      features: [
        "Up to $50,000 trading limit",
        "Advanced market data",
        "Priority email support",
        "10 active trades",
        "Advanced analytics",
        "API access",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 79.99,
      description: "For professional traders",
      icon: "💎",
      features: [
        "Up to $500,000 trading limit",
        "Real-time market data",
        "24/7 phone & chat support",
        "Unlimited active trades",
        "Professional analytics",
        "API access",
        "Custom indicators",
        "Dedicated account manager",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 199.99,
      description: "For institutional traders",
      icon: "👑",
      features: [
        "Unlimited trading limit",
        "Premium market data feeds",
        "24/7 dedicated support",
        "Unlimited active trades",
        "Enterprise analytics",
        "API access",
        "Custom indicators & bots",
        "Dedicated account manager",
        "Priority execution",
        "Custom integrations",
      ],
    },
  ];

  const currentPlan = "standard";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Account</h1>
        <p className="text-gray-600 mt-2">Choose the perfect plan for your trading needs</p>
      </div>

      {/* Current Plan Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-bold">Current Plan:</span> Standard Plan - $29.99/month
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer relative ${
              plan.id === currentPlan
                ? "border-green-500 bg-green-50"
                : selectedPlan === plan.id
                  ? "border-blue-600 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
            )}

            {/* Current Badge */}
            {plan.id === currentPlan && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                CURRENT
              </div>
            )}

            <div className="p-6">
              {/* Icon and Name */}
              <div className="mb-4">
                <span className="text-4xl mb-2 block">{plan.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-sm text-gray-600">/month</span>
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              {plan.id === currentPlan ? (
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I upgrade or downgrade anytime?",
              a: "Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, bank transfers, and cryptocurrency payments.",
            },
            {
              q: "Is there a free trial?",
              a: "Yes, all new users get a 7-day free trial of any plan they choose.",
            },
            {
              q: "What happens if I downgrade?",
              a: "You'll get a prorated refund for the unused portion of your current billing cycle.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <p className="font-medium text-gray-900 mb-2">{faq.q}</p>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Sales */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Need Custom Plan?</h2>
        <p className="mb-4">Contact our sales team for enterprise solutions and custom pricing</p>
        <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Get in Touch
        </button>
      </div>
    </div>
  );
};

export const UpgradePage: React.FC = () => {
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
      <UpgradePageContent />
    </DashboardLayout>
  );
};

export default UpgradePage;
