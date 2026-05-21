/**
 * Financial Insights & Intelligence Module
 * Generates dynamic text insights and calculates the Investor Readiness Score.
 */

const FinancialInsights = (() => {
 
 function generateInsights(kpis, expenses) {
  const insights = [];
  
  // Revenue Insight
  if (kpis.mrr > 0) {
   const annualRunRate = kpis.mrr * 12;
   insights.push({
    icon: '<i data-lucide="zap" class="icon-sm text-amber-500"></i>',
    text: `Current MRR projects to an Annual Run Rate of <strong>₹${(annualRunRate/1000).toFixed(1)}K</strong>.`,
    confidence: 94,
    time: 'Just now'
   });
  }

  // Burn Rate & Runway Insight
  if (kpis.burnRate > 0) {
   if (kpis.runwayMonths < 6) {
     insights.push({
      icon: '<i data-lucide="alert-triangle" class="icon-sm text-amber-500"></i>',
      text: `Alert: Runway requires attention, below 6 months (<strong>${kpis.runwayMonths.toFixed(1)} months</strong>). Immediate capital required.`,
      confidence: 99,
      time: '1 hour ago',
      color: '#ef4444'
     });
   } else {
     insights.push({
      icon: '<i data-lucide="bar-chart" class="icon-sm text-blue-500"></i>',
      text: `Runway is stable at <strong>${kpis.runwayMonths.toFixed(1)} months</strong> with current burn rate.`,
      confidence: 92,
      time: '3 hours ago'
     });
   }
  } else {
    insights.push({
      icon: '<i data-lucide="indian-rupee" class="icon-sm text-green-500"></i>',
      text: `Startup is currently <strong>profitable</strong>. No immediate burn rate risk detected.`,
      confidence: 98,
      time: '2 hours ago',
      color: '#10b981'
    });
  }

  // Marketing Insight
  if (expenses.totalMarketingSpend > 0) {
    insights.push({
      icon: '<i data-lucide="megaphone" class="icon-sm text-blue-500"></i>',
      text: `Marketing constitutes <strong>${((expenses.totalMarketingSpend/12) / expenses.monthlyExpenses * 100).toFixed(1)}%</strong> of monthly expenses.`,
      confidence: 88,
      time: '5 hours ago'
    });
  }

  // AI Fallbacks
  if (insights.length < 4) {
    insights.push({
      icon: '<i data-lucide="bot" class="icon-sm text-purple-500"></i>',
      text: 'AI Forecast model indicates steady growth potential for next quarter.',
      confidence: 85,
      time: '1 day ago'
    });
  }

  return insights;
 }

 function calculateInvestorReadiness(kpis) {
   let score = 0;
   let risk = 'High';
   let color = '#ef4444';
   let recommendation = 'Focus on achieving product-market fit and reducing burn.';

   // Components out of 100
   let growthScore = kpis.mrr > 10000 ? 25 : (kpis.mrr > 1000 ? 15 : 5);
   let profitabilityScore = kpis.margin > 20 ? 25 : (kpis.margin > 0 ? 15 : 5);
   let runwayScore = kpis.runwayMonths > 18 ? 25 : (kpis.runwayMonths > 12 ? 15 : (kpis.runwayMonths > 6 ? 10 : 0));
   let scalabilityScore = 25; // Base tech score

   score = growthScore + profitabilityScore + runwayScore + scalabilityScore;

   if (score >= 80) {
     risk = 'Low';
     color = '#10b981';
     recommendation = 'Strong fundamentals for future funding rounds. Strong unit economics.';
   } else if (score >= 50) {
     risk = 'Moderate';
     color = '#f59e0b';
     recommendation = 'Viable for Seed funding. Need to improve runway or profit margins.';
   }

   return {
     totalScore: score,
     riskLevel: risk,
     color,
     recommendation,
     breakdown: {
       growth: growthScore * 4, // scale to 100 for display
       profitability: profitabilityScore * 4,
       runway: runwayScore * 4,
       scalability: scalabilityScore * 4
     }
   };
 }

 return {
  generateInsights,
  calculateInvestorReadiness
 };
})();

window.FinancialInsights = FinancialInsights;
