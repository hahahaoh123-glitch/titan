/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  BrainCircuit, 
  ShieldCheck, 
  ChevronRight, 
  Menu, 
  X,
  Sparkles,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";

// UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass-card p-6 ${className}`}>
    {children}
  </div>
);

const NeonButton = ({ children, onClick, active }: { children: React.ReactNode, onClick: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium transition-all ${
      active 
      ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]' 
      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
    }`}
  >
    {children}
  </button>
);

// --- Simulator ---
const CompoundSimulator = ({ allocation }: { allocation: { stocks: number, bonds: number, cash: number } }) => {
  // 自動根據配置計算年報酬率
  const autoRate = useMemo(() => {
    return (allocation.stocks * 0.08 + allocation.bonds * 0.04 + allocation.cash * 0.015);
  }, [allocation]);

  const [p, setP] = useState(100000);
  const [r, setR] = useState(Number(autoRate.toFixed(1)));
  const [y, setY] = useState(25);

  // 當配置改變時，同步更新利率
  useMemo(() => {
    setR(Number(autoRate.toFixed(1)));
  }, [autoRate]);

  const data = useMemo(() => {
    const rate = r / 100;
    return Array.from({ length: y + 1 }, (_, i) => ({
      year: i,
      amount: Math.round(p * Math.pow(1 + rate, i)),
    }));
  }, [p, r, y]);

  const finalAmount = data[data.length - 1].amount;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-neon bg-neon/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-neon/20 rounded-lg text-neon mt-1"><TrendingUp className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-neon">連接性模擬：配置 → 增長</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              系統已將您的資產配置比重自動轉換為預估年化報酬率（{autoRate.toFixed(1)}%）。
              您可以手動微調參數，觀察不同配置在長期複利下的最終結果差異。
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 space-y-6">
          <h3 className="text-neon font-bold tracking-widest flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> 參數設定
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">初始本金 (TWD)</label>
              <input type="number" value={p} onChange={e => setP(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">年化報酬率 (%)</label>
              <input type="number" step="0.1" value={r} onChange={e => setR(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">投資年限 (Years)</label>
              <input type="number" value={y} onChange={e => setY(Number(e.target.value))} className="w-full" />
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-tighter">終端預估總值</p>
            <p className="text-3xl font-black text-neon neon-text">${finalAmount.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[300px] md:min-h-[400px]">
          <h3 className="text-slate-400 font-medium mb-6">資產增長趨勢曲線</h3>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val / 10000}W`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020202', border: '1px solid #00f2ff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Target Planner ---
const TargetPlanner = ({ allocation }: { allocation: { stocks: number, bonds: number, cash: number } }) => {
  const autoRate = (allocation.stocks * 0.08 + allocation.bonds * 0.04 + allocation.cash * 0.015);
  const [goal, setGoal] = useState(10000000);
  const [rate, setRate] = useState(Number(autoRate.toFixed(1)));
  const [years, setYears] = useState(20);

  const monthlySaving = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return goal / n;
    return Math.round(goal * r / (Math.pow(1 + r, n) - 1));
  }, [goal, rate, years]);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-gold bg-gold/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-gold/20 rounded-lg text-gold mt-1"><Target className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-gold">目標達成：將夢想數字化</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              系統已導入您的資產配置報酬率（{rate}%）。在此模擬下，
              若要達成目標，您每個月需固定投入的金額將被精確計算。
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <h3 className="text-neon font-bold tracking-widest flex items-center gap-2">
            <Target className="w-5 h-5" /> 夢想達成設定
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">預期目標金額 (TWD)</label>
              <input type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">預期投報率 (%)</label>
              <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">計畫年限 (Years)</label>
              <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center space-y-4 min-h-[250px]">
          <div className="p-4 bg-neon/10 rounded-full">
            <Wallet className="w-12 h-12 text-neon" />
          </div>
          <p className="text-slate-400 text-sm md:text-base">為了達成此計畫，您每月需投入：</p>
          <p className="text-4xl md:text-5xl font-black text-neon neon-text">${monthlySaving.toLocaleString()}</p>
          <p className="text-[10px] text-slate-600 italic mt-4">註：計算基於複利滾存每月一次</p>
        </Card>
      </div>
    </div>
  );
};

// --- Retirement Engine (New Content) ---
const RetirementEngine = ({ allocation }: { allocation: { stocks: number, bonds: number, cash: number } }) => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [monthlySpend, setMonthlySpend] = useState(50000);
  const [inflation, setInflation] = useState(2.5);

  const portfolioRate = (allocation.stocks * 0.08 + allocation.bonds * 0.04 + allocation.cash * 0.015);
  const yearsToRetire = retireAge - currentAge;
  
  // 計算考慮通膨後的每月生活費
  const futureMonthlySpend = useMemo(() => {
    return Math.round(monthlySpend * Math.pow(1 + inflation / 100, yearsToRetire));
  }, [monthlySpend, inflation, yearsToRetire]);

  // 基於 4% 退職法則需要的總額
  const targetFund = futureMonthlySpend * 12 * 25;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-gold bg-gold/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-gold/20 rounded-lg text-gold mt-1"><Target className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-gold">退休金深度模擬 (含通膨因素)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              退休不只是存錢，還要對抗通膨。如果您現在生活費 5 萬，30 年後在 2.5% 通膨下需要約 10.5 萬才能維持相同品質。
              本模組根據您的「資產配置」回報率與「4% 安全提領法則」計算您的財富缺口。
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <h3 className="text-neon font-bold tracking-widest">參數設定</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">當前年齡</label>
                <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">預計退休年齡</label>
                <input type="number" value={retireAge} onChange={e => setRetireAge(Number(e.target.value))} className="w-full" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">目前每月開銷 (TWD)</label>
              <input type="number" value={monthlySpend} onChange={e => setMonthlySpend(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">預估長期通膨率 (%)</label>
              <input type="number" step="0.1" value={inflation} onChange={e => setInflation(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </Card>

        <Card className="space-y-8 flex flex-col justify-center">
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase">退休時所需每月生活費 (含通膨)</p>
            <p className="text-3xl font-black text-white">${futureMonthlySpend.toLocaleString()}</p>
          </div>
          <div className="space-y-2 border-t border-white/5 pt-6">
            <p className="text-xs text-slate-500 uppercase">依據 4% 法則需準備之退休總額</p>
            <p className="text-5xl font-black text-neon neon-text">${targetFund.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600 mt-2 italic">※ 註：代表退休後每年僅提領資產的 4%，理論上可支應無限期退休生活。</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Crisis Stress Test (New Content) ---
const StressTest = ({ allocation }: { allocation: { stocks: number, bonds: number, cash: number } }) => {
  // 模擬 2008 金融海嘯場景下的各資產表現權重
  // 股票 -50%, 債券 +5%, 現金 0%
  const crisisLoss = (allocation.stocks * (-0.5) + allocation.bonds * (0.05) + allocation.cash * 0);
  const lossPercentage = Math.abs(crisisLoss).toFixed(1);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-red-500 bg-red-500/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500 mt-1"><BrainCircuit className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-red-500">極端市場壓力測試 (金融海嘯模擬)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              如果明天發生 2008 年級別的金融危機，您的帳面資產會發生什麼事？
              透過歷史極端數據模擬，我們能預判當前的配置是否在您的心理承受範圍內。
            </p>
          </div>
        </div>
      </Card>

      <Card className="py-12 flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center relative z-10">
             <div className="text-center">
                <p className="text-xs text-slate-500">瞬間回檔</p>
                <p className="text-5xl font-black text-red-500">-{lossPercentage}%</p>
             </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-red-500 rounded-full blur-3xl z-0"
          />
        </div>

        <div className="max-w-md space-y-4">
          <h4 className="text-xl font-bold">診斷：{Number(lossPercentage) > 30 ? "高度波動警報" : (Number(lossPercentage) > 15 ? "風險均衡" : "防禦力極強")}</h4>
          <p className="text-sm text-slate-400">
            在極端危機中，您的資產將縮水約 <span className="text-red-400 font-bold">{lossPercentage}%</span>。
            {Number(lossPercentage) > 30 
              ? "這可能會引發嚴重的恐慌。建議增加債券或現金比重來強化防禦。" 
              : "您的配置展現了極佳的防禦性，能有效吸收市場衝擊。"}
          </p>
        </div>
      </Card>
    </div>
  );
};

// --- Asset Allocator ---
const AssetAllocator = ({ allocation, onChange, riskProfile, onGo }: { 
  allocation: { stocks: number, bonds: number, cash: number },
  onChange: (a: any) => void,
  riskProfile: string | null,
  onGo: () => void
}) => {
  const data = [
    { name: '股票', value: allocation.stocks, color: '#00f2ff' },
    { name: '債券', value: allocation.bonds, color: '#ffd700' },
    { name: '現金', value: allocation.cash, color: '#475569' },
  ];

  // Proportional dynamic slider update keeping sum exactly at 100% for silky smooth sliding (滑動)
  const handleSliderChange = (key: 'stocks' | 'bonds' | 'cash', val: number) => {
    const otherKeys = (['stocks', 'bonds', 'cash'] as const).filter(k => k !== key);
    const k1 = otherKeys[0];
    const k2 = otherKeys[1];
    
    const currentTotalOther = allocation[k1] + allocation[k2];
    const remaining = 100 - val;
    
    let newK1 = 0;
    let newK2 = 0;
    
    if (currentTotalOther > 0) {
      newK1 = Math.round((allocation[k1] / currentTotalOther) * remaining);
      newK2 = remaining - newK1;
    } else {
      newK1 = Math.round(remaining / 2);
      newK2 = remaining - newK1;
    }
    
    // Bounds guard safety check
    if (newK1 < 0) {
      newK2 += newK1;
      newK1 = 0;
    }
    if (newK2 < 0) {
      newK1 += newK2;
      newK2 = 0;
    }
    
    onChange({
      [key]: val,
      [k1]: newK1,
      [k2]: newK2
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-neon bg-neon/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-neon/20 rounded-lg text-neon mt-1"><PieChart className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-neon">
              {riskProfile ? `根據您的 ${riskProfile} 屬性建議配置` : "為什麼要分配資產？"}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              拖拽滑桿時其餘比例將**自動等比例增減（完美等比例連動）**。系統將立即依據比重動態演算未來預期增長。
              這讓您在調整資產比重時感受到最極致流暢的滑動效果。
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 space-y-6">
          <h3 className="text-neon font-bold tracking-widest flex items-center gap-2">
            <PieChart className="w-5 h-5" /> 比重動態調整
          </h3>
          <div className="space-y-6">
            {['股票', '債券', '現金'].map((type, idx) => {
              const key = idx === 0 ? 'stocks' : idx === 1 ? 'bonds' : 'cash';
              return (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-slate-400 font-medium">{type}</label>
                    <span className="text-xs font-bold text-neon">{allocation[key as keyof typeof allocation]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={allocation[key as keyof typeof allocation]} 
                    onChange={e => handleSliderChange(key as 'stocks' | 'bonds' | 'cash', Number(e.target.value))}
                    className="w-full accent-neon cursor-pointer h-2 bg-black/40 rounded-lg outline-none appearance-none"
                  />
                </div>
              );
            })}
            <div className="text-xs p-2 rounded text-center text-green-500 bg-green-500/10 font-bold border border-green-500/20">
              比例總和：{allocation.stocks + allocation.bonds + allocation.cash}% (極速智動均衡)
            </div>
            <button 
              onClick={onGo}
              className="w-full py-3 bg-neon text-black font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              進入演算模擬
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full h-[250px] md:h-[300px] flex items-center justify-center relative">
            <RePieChart width={250} height={250}>
              <Pie 
                data={data} 
                innerRadius={70} 
                outerRadius={100} 
                paddingAngle={5} 
                dataKey="value" 
                stroke="none"
                isAnimationActive={true}
                animationDuration={300}
              >
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#020202', border: '1px solid #00f2ff20', borderRadius: '12px' }} itemStyle={{ color: '#00f2ff' }} />
            </RePieChart>
            {/* Center value display */}
            <div className="absolute text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">股票比重</p>
              <p className="text-2xl font-black text-white">{allocation.stocks}%</p>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <h4 className="font-bold border-l-2 border-neon pl-3 text-white">策略洞察</h4>
            <div className="text-sm text-slate-400 space-y-3 leading-relaxed">
              <p>
                {allocation.stocks > 70 ? "🔥 進攻型配置：您追求最大化成長，但需具備強大的心理素質。" : 
                 allocation.stocks > 40 ? "⚖️ 平衡型配置：在大盤成長與抗震之間取得了優點。" :
                 "🛡️ 防禦型配置：您的主要目標是資產保全。"}
              </p>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 shadow-inner">
                <p className="text-[10px] text-slate-500 uppercase">預估年化報酬率</p>
                <p className="text-2xl font-black text-neon">{(allocation.stocks * 0.08 + allocation.bonds * 0.04 + allocation.cash * 0.015).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- AI Advisor (Removed as requested) ---

// --- Risk Quiz ---
const RiskAssessment = ({ onComplete }: { onComplete: (res: string) => void }) => {
  const [step, setStep] = useState(0);
  const [score1, setScore1] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (score: number) => {
    if (step === 0) {
      setScore1(score);
      setStep(1);
    } else {
      const totalScore = score1 + score;
      let finalType = '穩健型 (Balanced)';
      if (totalScore >= 5) {
        finalType = '積極型 (High Growth)';
      } else if (totalScore <= 3) {
        finalType = '保守型 (Defensive)';
      }
      setResult(finalType);
      onComplete(finalType);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-neon bg-neon/5">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-neon/20 rounded-lg text-neon mt-1"><ShieldCheck className="w-5 h-5"/></div>
          <div>
            <h3 className="font-bold text-lg text-neon">為什麼要測風險？</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              理財最怕的是「在錯誤的時間做出錯誤的反應」。透過測驗了解自己的抗壓性，能幫你選出「睡得著覺」的投資組合。
              如果風險太高，你可能會在市場最低點因為恐慌而撤資，導致永久性虧損。
            </p>
          </div>
        </div>
      </Card>

      <Card className="text-center py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h2 className="text-xl md:text-2xl font-black text-neon neon-text uppercase tracking-widest px-4">
                {step === 0 ? "Q1: 如果市場崩跌 25%，你會？" : "Q2: 您這筆投資預計要置放多久，能承受多少資產年波動？"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
                  {step === 0 ? (
                    <>
                      <button onClick={() => handleAnswer(3)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        視為打折，借錢也要買
                        <span className="block text-xs text-slate-400 mt-1 font-normal">（積極尋求超額報酬）</span>
                      </button>
                      <button onClick={() => handleAnswer(2)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        保持觀望，按兵不動
                        <span className="block text-xs text-slate-400 mt-1 font-normal">（先觀察情勢、續抱資產）</span>
                      </button>
                      <button onClick={() => handleAnswer(1)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        立刻停損，保住現金
                        <span className="block text-xs text-slate-400 mt-1 font-normal">（規避進一步的資產震盪）</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAnswer(3)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        5年以上長期投資
                        <span className="block text-xs text-slate-400 mt-1 font-normal">可承擔30%以上劇烈震盪，追求翻倍空間</span>
                      </button>
                      <button onClick={() => handleAnswer(2)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        2至5年中期規劃
                        <span className="block text-xs text-slate-400 mt-1 font-normal">接受15%上下溫和波動，希望資產穩健成長</span>
                      </button>
                      <button onClick={() => handleAnswer(1)} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all text-sm md:text-base font-bold text-white">
                        2年以內短適配置
                        <span className="block text-xs text-slate-400 mt-1 font-normal">幾乎無法忍受虧損，要求極低波動與高流動性</span>
                      </button>
                    </>
                  )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 px-4">
              <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-neon mx-auto" />
              <h2 className="text-2xl md:text-3xl font-black">診斷結果</h2>
              <div className="bg-neon/10 border border-neon/30 p-4 rounded-lg text-neon text-lg md:text-xl font-bold inline-block">
                {result}
              </div>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                診斷建議：建議將此結果應用至「資產配置」模組。若是積極型，股票佔比可調高；若是穩健型，建議維持股債平衡。
              </p>
              <button onClick={() => {setStep(0); setScore1(0); setResult(null)}} className="block mx-auto text-xs text-slate-500 hover:text-neon underline">重新測試</button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

// --- Code Reference Section (Removed UI as requested) ---
const Home = ({ 
  allocation, 
  onChange, 
  onGo 
}: { 
  allocation: { stocks: number, bonds: number, cash: number },
  onChange: (a: any) => void,
  onGo: (id: string) => void 
}) => {
  const data = [
    { name: '股票', value: allocation.stocks, color: '#00f2ff' },
    { name: '債券', value: allocation.bonds, color: '#ffd700' },
    { name: '現金', value: allocation.cash, color: '#475569' },
  ];

  const handleSliderChange = (key: 'stocks' | 'bonds' | 'cash', val: number) => {
    const otherKeys = (['stocks', 'bonds', 'cash'] as const).filter(k => k !== key);
    const k1 = otherKeys[0];
    const k2 = otherKeys[1];
    
    const currentTotalOther = allocation[k1] + allocation[k2];
    const remaining = 100 - val;
    
    let newK1 = 0;
    let newK2 = 0;
    
    if (currentTotalOther > 0) {
      newK1 = Math.round((allocation[k1] / currentTotalOther) * remaining);
      newK2 = remaining - newK1;
    } else {
      newK1 = Math.round(remaining / 2);
      newK2 = remaining - newK1;
    }
    
    if (newK1 < 0) {
      newK2 += newK1;
      newK1 = 0;
    }
    if (newK2 < 0) {
      newK1 += newK2;
      newK2 = 0;
    }
    
    onChange({
      ...allocation,
      [key]: val,
      [k1]: newK1,
      [k2]: newK2
    });
  };

  const estimatedReturn = useMemo(() => {
    return (allocation.stocks * 0.08 + allocation.bonds * 0.04 + allocation.cash * 0.015).toFixed(1);
  }, [allocation]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <Card className="relative overflow-hidden group border-neon/30">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl md:text-3xl font-black neon-text uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="text-neon animate-pulse" /> 系統概覽：整合型金融模擬
          </h2>
          <p className="text-slate-300 max-w-3xl leading-relaxed text-sm md:text-base">
            這是一個高度關聯的理財引擎。在本系統中，您的「風險屬性」與「資產配置」會自動調控「報酬預期」，
            並整合「複利演算」來推算「退休缺口」與「市場極端壓力」。
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Wallet className="w-64 h-64 text-white" />
        </div>
      </Card>

      {/* Main Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Step Guide */}
        <Card className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-widest text-lg flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
              引導步驟 / 診斷
            </h3>
            
            <div className="space-y-3">
              <button onClick={() => onGo('risk')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-neon hover:bg-neon/10 hover:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all text-left group">
                <div className="p-2 bg-neon/10 rounded-full text-neon shrink-0 group-hover:scale-110 transition-transform"><ShieldCheck className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-xs group-hover:text-neon transition-colors">步驟一：風險診斷</p>
                  <p className="text-[10px] text-slate-500">了解自己的心理底線。</p>
                </div>
              </button>
              
              <button onClick={() => onGo('allocation')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-neon hover:bg-neon/10 hover:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all text-left group">
                <div className="p-2 bg-neon/10 rounded-full text-neon shrink-0 group-hover:scale-110 transition-transform"><PieChart className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-xs group-hover:text-neon transition-colors">步驟二：資產配置</p>
                  <p className="text-[10px] text-slate-500">連動計算預計報酬率。</p>
                </div>
              </button>

              <button onClick={() => onGo('sim')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-neon hover:bg-neon/10 hover:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all text-left group">
                <div className="p-2 bg-neon/10 rounded-full text-neon shrink-0 group-hover:scale-110 transition-transform"><TrendingUp className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-xs group-hover:text-neon transition-colors">步驟三：成長演算</p>
                  <p className="text-[10px] text-slate-400 font-medium">長期複利模力模擬。</p>
                </div>
              </button>

              <button onClick={() => onGo('retirement')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-gold/30 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(100,85,5,0.4)] transition-all text-left text-gold group">
                <div className="p-2 bg-gold/10 rounded-full text-gold shrink-0 group-hover:scale-110 transition-transform"><Sparkles className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-xs text-gold">進階：退休與通膨</p>
                  <p className="text-[10px] text-slate-400">考慮實質購買力缺口。</p>
                </div>
              </button>

              <button onClick={() => onGo('stress')} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-xl border-red-500/30 hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all text-left text-red-400 group">
                <div className="p-2 bg-red-500/10 rounded-full text-red-500 shrink-0 group-hover:scale-110 transition-transform"><BrainCircuit className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-xs text-red-400">核心：極端壓力測試</p>
                  <p className="text-[10px] text-slate-400">模擬 2008 年級縮水。</p>
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Right Side: Aurora Interactive Allocator & Pie Chart (極光、滑動、原餅圖) */}
        <Card className="lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-black/80 to-[#04010a]/90 border border-neon/20">
          {/* Internal Aurora Glowing Effects behind the Pie Chart */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neon/15 to-transparent pointer-events-none blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-neon/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-neon font-black tracking-widest text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-neon" /> 極光智動資產配置盤
              </h3>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded">
                LIVE DYNAMIC PORTFOLIO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Sliders on Left of inner grid */}
              <div className="md:col-span-6 space-y-5">
                <p className="text-xs text-slate-400 leading-relaxed">
                  拖曳滑桿即時連動，體驗**智動等比例調整**與極致流暢的滑動回饋：
                </p>
                
                {['股票', '債券', '現金'].map((type, idx) => {
                  const key = idx === 0 ? 'stocks' : idx === 1 ? 'bonds' : 'cash';
                  const labelColor = idx === 0 ? 'text-neon' : idx === 1 ? 'text-gold' : 'text-slate-400';
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${labelColor} flex items-center gap-1.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-neon' : idx === 1 ? 'bg-gold' : 'bg-slate-400'}`} />
                          {type}
                        </span>
                        <span className="text-xs font-mono font-black text-white bg-white/5 px-1.5 py-0.5 rounded">
                          {allocation[key as keyof typeof allocation]}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={allocation[key as keyof typeof allocation]} 
                        onChange={e => handleSliderChange(key as 'stocks' | 'bonds' | 'cash', Number(e.target.value))}
                        className="w-full accent-neon cursor-pointer h-1.5 bg-white/5 rounded-lg outline-none appearance-none hover:bg-white/10 transition-colors"
                      />
                    </div>
                  );
                })}

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">預估年報酬率</span>
                  <p className="text-2xl font-black text-neon font-mono">{estimatedReturn}%</p>
                </div>
              </div>

              {/* Pie Chart on Right of inner grid */}
              <div className="md:col-span-6 flex flex-col items-center justify-center relative md:border-l md:border-white/5 md:pl-4">
                <div className="w-full h-[220px] flex items-center justify-center relative">
                  <RePieChart width={220} height={220}>
                    <Pie 
                      data={data} 
                      innerRadius={65} 
                      outerRadius={90} 
                      paddingAngle={4} 
                      dataKey="value" 
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={300}
                    >
                      {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020202', border: '1px solid #00f2ff20', borderRadius: '12px' }} 
                      itemStyle={{ color: '#00f2ff' }} 
                    />
                  </RePieChart>
                  
                  {/* Center percentage summary */}
                  <div className="absolute text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">股 / 債 / 幣</p>
                    <p className="text-xl font-black text-white font-mono animate-fade-in">
                      {allocation.stocks}:{allocation.bonds}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] flex gap-3 text-slate-500 mt-2 font-mono">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon inline-block" /> 股: {allocation.stocks}%</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> 債: {allocation.bonds}%</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> 現: {allocation.cash}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>

      <SavingChallenges />
    </div>
  );
};

// --- Saving Challenges ---
const SavingChallenges = () => {
  const challenges = [
    { title: "52週存錢挑戰", desc: "每週遞增 100 元，一年可額外多存 13.7 萬元。", icon: TrendingUp },
    { title: "365天存錢日記", desc: "每天存 1~365 元隨機數，建立每日理財紀律。", icon: Wallet },
    { title: "定額強制存錢", desc: "發薪日自動轉帳資產的 20%，這是致富最快捷徑。", icon: ShieldCheck },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {challenges.map((c, i) => (
        <div key={i}>
          <Card className="hover:border-gold transition-colors group cursor-pointer">
            <c.icon className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-2">{c.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
          </Card>
        </div>
      ))}
    </div>
  );
};


// --- Main App ---
export default function App() {
  const [riskProfile, setRiskProfile] = useState<string | null>(null);
  const [allocation, setAllocation] = useState({ stocks: 60, bonds: 30, cash: 10 });
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: '首頁引導', icon: Wallet },
    { id: 'risk', label: '風險診斷', icon: ShieldCheck },
    { id: 'allocation', label: '資產配置', icon: PieChart },
    { id: 'sim', label: '複利演算', icon: TrendingUp },
    { id: 'target_plan', label: '目標達成', icon: Target },
    { id: 'retirement', label: '退休金模擬', icon: Sparkles },
    { id: 'stress', label: '壓力測試', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Textured Aurora Ambient Background Container */}
      <div className="aurora-bg">
        <div className="aurora-grid" />
        <div className="aurora-glow-1" />
        <div className="aurora-glow-2" />
        <div className="aurora-glow-3" />
      </div>

      {/* Header */}
      <header className="h-16 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between bg-black/45">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon rounded flex items-center justify-center font-black text-black text-xl">T</div>
          <span className="font-black tracking-[4px] text-neon neon-text">TITAN_SYSTEM</span>
        </div>
        
        <nav className="hidden md:flex gap-1.5">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 border ${
                activeTab === tab.id 
                  ? 'bg-neon/15 text-neon font-black border-neon shadow-[0_0_15px_rgba(0,242,255,0.4),_inset_0_0_8px_rgba(0,242,255,0.2)] text-shadow-neon' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-neon animate-pulse' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <button className="md:hidden text-neon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden relative z-40"
          >
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                className={`w-full text-left px-8 py-4 border-b border-white/5 transition-all flex items-center gap-3 ${
                  activeTab === tab.id 
                    ? 'bg-neon/20 text-neon font-bold border-l-4 border-l-neon shadow-[0_0_20px_rgba(0,242,255,0.2),_inset_0_0_15px_rgba(0,242,255,0.15)] text-shadow-neon' 
                    : 'text-slate-300 hover:bg-neon/10'
                }`}
              >
                <tab.icon className="w-4 h-4 text-neon" />
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 mb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {activeTab === 'home' && (
              <Home 
                allocation={allocation} 
                onChange={setAllocation} 
                onGo={setActiveTab} 
              />
            )}
            {activeTab === 'risk' && (
              <RiskAssessment 
                onComplete={(res) => { 
                  setRiskProfile(res); 
                  const lowerRes = res.toLowerCase();
                  if (lowerRes.includes('積極') || lowerRes.includes('aggressive')) {
                    setAllocation({ stocks: 80, bonds: 15, cash: 5 });
                  } else if (lowerRes.includes('穩健') || lowerRes.includes('balanced')) {
                    setAllocation({ stocks: 50, bonds: 35, cash: 15 });
                  } else if (lowerRes.includes('保守') || lowerRes.includes('conservative') || lowerRes.includes('defensive')) {
                    setAllocation({ stocks: 20, bonds: 50, cash: 30 });
                  }
                  setActiveTab('allocation'); 
                }} 
              />
            )}
            {activeTab === 'allocation' && <AssetAllocator allocation={allocation} onChange={setAllocation} riskProfile={riskProfile} onGo={() => setActiveTab('sim')} />}
            {activeTab === 'sim' && <CompoundSimulator allocation={allocation} />}
            {activeTab === 'target_plan' && <TargetPlanner allocation={allocation} />}
            {activeTab === 'retirement' && <RetirementEngine allocation={allocation} />}
            {activeTab === 'stress' && <StressTest allocation={allocation} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/5 bg-black/45 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-700">
           <span>TITAN_SYSTEM INTERACTIVE CORE V2.1.0</span>
           <span>SEC_STATUS: STANDBY</span>
        </div>
      </footer>
    </div>
  );
}
