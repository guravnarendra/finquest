// FinQuest question bank.
// Every test = 7 MCQ (3 options each) + 3 scenario questions, picked at
// random from this bank, so each run is different ("10 diff ques").
// Difficulty: beginner | intermediate | advanced

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Topic =
  | "SIP"
  | "Mutual Funds"
  | "Stocks"
  | "Risk"
  | "Compounding"
  | "Inflation"
  | "Diversification"
  | "Emergency Fund"
  | "Tax";

export type Mcq = {
  kind: "mcq";
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
};

export type Scenario = {
  kind: "scenario";
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  title: string;
  situation: string;
  prompt: string;
  /** Concepts a good answer should mention (rule-based scoring). */
  keywords: string[];
  /** Words/phrases that signal a weak / panic answer. */
  redFlags: string[];
  ideal: string;
  hint: string;
};

export type Question = Mcq | Scenario;

export const MCQS: Mcq[] = [
  { kind: "mcq", id: "m1", topic: "SIP", difficulty: "beginner", question: "SIP ka sabse bada fayda kya hai?", options: ["Market timing perfect ho jata hai", "Har mahine fixed amount invest karke rupee-cost averaging milta hai", "Guaranteed 20% return milta hai"], correctIndex: 1, explanation: "SIP me har mahine fixed amount jata hai — market upar ho ya neeche, units average price par milte hain. Isi ko rupee-cost averaging kehte hain. Koi guaranteed return nahi hota." },
  { kind: "mcq", id: "m2", topic: "Mutual Funds", difficulty: "beginner", question: "Equity mutual fund me tumhara paisa kahan lagta hai?", options: ["Sirf bank FD me", "Kai companies ke shares me, ek fund manager ke through", "Sirf gold me"], correctIndex: 1, explanation: "Equity fund tumhara paisa 30-100 companies ke shares me baant deta hai. Ek fund manager research karke decide karta hai kahan lagana hai." },
  { kind: "mcq", id: "m3", topic: "Compounding", difficulty: "beginner", question: "₹5,000/month SIP, 12% average return, 20 saal — approx kitna banta hai?", options: ["₹12 lakh (sirf invested amount)", "₹25 lakh ke aas-paas", "₹50 lakh"], correctIndex: 2, explanation: "Invested ₹12 lakh hota hai, par compounding se corpus ~₹50 lakh ke aas-paas banta hai. Time hi compounding ka sabse bada dost hai — jaldi start karna sabse important hai." },
  { kind: "mcq", id: "m4", topic: "Risk", difficulty: "beginner", question: "Risk aur return ka relation kya hai?", options: ["Zyada risk = hamesha zyada return", "Zyada risk = zyada return ki possibility, par loss ki possibility bhi zyada", "Risk ka return se koi lena-dena nahi"], correctIndex: 1, explanation: "High risk sirf high return ki possibility deta hai, guarantee nahi. Isiliye risk ko samajh kar, apne time horizon ke hisab se lena chahiye." },
  { kind: "mcq", id: "m5", topic: "Inflation", difficulty: "beginner", question: "Inflation 6% hai aur tumhara FD 5.5% de raha hai. Asli me kya ho raha hai?", options: ["Paisa badh raha hai", "Paisa real value me kam ho raha hai", "Koi farak nahi padta"], correctIndex: 1, explanation: "Real return = 5.5% - 6% = -0.5%. Tumhare paise ki buying power har saal kam ho rahi hai. Isiliye inflation se upar return chahiye." },
  { kind: "mcq", id: "m6", topic: "Emergency Fund", difficulty: "beginner", question: "Emergency fund kitna hona chahiye?", options: ["1 mahine ka kharcha", "3-6 mahine ka kharcha, savings account / liquid fund me", "Poori salary ek saal ki, shares me"], correctIndex: 1, explanation: "3-6 mahine ka kharcha emergency fund me rakho — aise jagah jahan se turant nikale, jaise savings ya liquid fund. Shares me emergency fund nahi rakhte." },
  { kind: "mcq", id: "m7", topic: "Diversification", difficulty: "beginner", question: "Diversification ka matlab kya hai?", options: ["Ek hi best stock me saara paisa lagana", "Paisa alag-alag assets me baantna taaki ek ke girne se sab na doobe", "Har din stock khareedna-bechna"], correctIndex: 1, explanation: "'Don't put all eggs in one basket.' Alag sectors, alag asset classes — equity, debt, gold — me baantne se ek ke girne par poora portfolio nahi girta." },
  { kind: "mcq", id: "m8", topic: "Stocks", difficulty: "intermediate", question: "Ek company ka P/E ratio bahut high hai. Iska matlab?", options: ["Company sasti hai", "Investors future growth ke liye zyada price de rahe hain — mahanga ho sakta hai", "Company band hone wali hai"], correctIndex: 1, explanation: "High P/E matlab market company se bahut growth expect kar raha hai. Agar growth na aaye, price gir sakta hai. P/E akele me buy/sell signal nahi hai." },
  { kind: "mcq", id: "m9", topic: "Mutual Funds", difficulty: "intermediate", question: "Index fund aur actively managed fund me main farak?", options: ["Index fund market ko copy karta hai, low cost; active fund manager stock pick karta hai, high cost", "Index fund sirf FD jaisa hai", "Active fund me koi risk nahi hota"], correctIndex: 0, explanation: "Index fund Nifty/Sensex jaisa index copy karta hai, expense ratio ~0.1-0.3%. Active fund me manager stock pick karta hai, cost ~1-2% aur har active fund index ko beat nahi karta." },
  { kind: "mcq", id: "m10", topic: "Tax", difficulty: "intermediate", question: "Equity mutual fund 1 saal se zyada rakhne par profit par tax?", options: ["Bilkul tax nahi", "LTCG 12.5% — ₹1.25 lakh tak ke profit par chhoot", "30% flat tax"], correctIndex: 1, explanation: "Equity LTCG (1 saal+) par 12.5% tax lagta hai, ₹1.25 lakh tak ke saalana profit par exemption hai. Short-term (1 saal se kam) par 20% lagta hai." },
  { kind: "mcq", id: "m11", topic: "SIP", difficulty: "intermediate", question: "Market crash me SIP ke saath sabse smart kaam?", options: ["SIP band karke paisa nikal lo", "SIP continue rakho — saste me zyada units milte hain", "Loan leke lump sum daal do"], correctIndex: 1, explanation: "Crash me SIP continue rakhne se saste NAV par zyada units milte hain — yahi rupee-cost averaging ka fayda hai. Panic sell sabse bada loss hota hai." },
  { kind: "mcq", id: "m12", topic: "Compounding", difficulty: "intermediate", question: "₹10,000 ek baar invest kiya, 12% return, 10 saal baad approx?", options: ["₹22,000", "₹31,000", "₹1,20,000"], correctIndex: 1, explanation: "₹10,000 × (1.12)^10 ≈ ₹31,000. Compounding me return par bhi return milta hai — isiliye 10 saal me paisa 3x ho jata hai." },
  { kind: "mcq", id: "m13", topic: "Risk", difficulty: "intermediate", question: "Tumhe 1 saal me ghar ke down payment ke paise chahiye. Kahan rakhoge?", options: ["Small-cap stocks me", "FD / liquid fund me", "Crypto me"], correctIndex: 1, explanation: "1 saal ka goal short-term hai — equity me itne kam time me loss ho sakta hai. Short-term goals ke liye FD/liquid fund safe rahta hai." },
  { kind: "mcq", id: "m14", topic: "Mutual Funds", difficulty: "advanced", question: "Expense ratio 2% vs 0.2% — 20 saal me kya farak padega?", options: ["Koi farak nahi", "Lakhs ka farak — high cost compounding ko kha jata hai", "Sirf ₹100-200 ka farak"], correctIndex: 1, explanation: "2% vs 0.2% ka 1.8% gap 20 saal me lakhon ka farak ban jata hai. Isiliye same category me low-cost fund lambi race me aage nikal jata hai." },
  { kind: "mcq", id: "m15", topic: "Stocks", difficulty: "advanced", question: "Blue-chip, mid-cap, small-cap me sabse volatile kaun?", options: ["Blue-chip", "Mid-cap", "Small-cap"], correctIndex: 2, explanation: "Small-cap me growth potential sabse zyada, par volatility aur risk bhi sabse zyada. Blue-chip stable bade companies hote hain." },
  { kind: "mcq", id: "m16", topic: "Diversification", difficulty: "advanced", question: "Portfolio me gold kyun rakhte hain?", options: ["Sirf shaadi ke liye", "Equity girne par gold aksar support deta hai — hedge ka kaam karta hai", "Gold se guaranteed 15% return milta hai"], correctIndex: 1, explanation: "Gold equity se alag behave karta hai — crisis me aksar upar jata hai. 5-10% gold portfolio ko balance karta hai." },
  { kind: "mcq", id: "m17", topic: "Inflation", difficulty: "advanced", question: "Real return nikalne ka formula?", options: ["Nominal return + inflation", "Nominal return - inflation", "Nominal return × inflation"], correctIndex: 1, explanation: "Real return ≈ Nominal return − Inflation. 12% return aur 6% inflation ho to real return ~6% hai — wahi tumhari asli kamai hai." },
  { kind: "mcq", id: "m18", topic: "SIP", difficulty: "advanced", question: "Step-up SIP kya hai?", options: ["Har saal SIP amount badhana — salary badhne ke saath", "SIP band karke dobara start karna", "Ek hi din me 2 SIP chalana"], correctIndex: 0, explanation: "Step-up SIP me har saal amount 10% jaise badhate ho. Salary badhne ke saath invest badhana corpus ko bahut bada kar deta hai." },
  { kind: "mcq", id: "m19", topic: "Mutual Funds", difficulty: "intermediate", question: "Nifty 50 Index me companies ka weightage kaise decide hota hai?", options: ["Government decide karti hai", "Free-float market capitalization ke hisab se", "Har company ka equal 2% weightage hota hai"], correctIndex: 1, explanation: "Nifty 50 me top 50 companies apne free-float market cap ke basis par weightage leti hain." },
  { kind: "mcq", id: "m20", topic: "Risk", difficulty: "intermediate", question: "Debt mutual fund me main risk kya hota hai?", options: ["Interest rate risk aur credit risk", "Market crash me 50% gir jana", "Fund manager ka paisa leke bhag jana"], correctIndex: 0, explanation: "Debt fund me interest rates badhne par NAV gir sakta hai (duration risk) aur company default kar sakti hai (credit risk)." },
  { kind: "mcq", id: "m21", topic: "Compounding", difficulty: "intermediate", question: "CAGR ka use kya hota hai?", options: ["Cash And Gold Ratio nikalna", "Multiple years me paisa kis annual rate se compound hua, wo nikalna", "Current Asset Growth Rate batana"], correctIndex: 1, explanation: "CAGR (Compound Annual Growth Rate) batata hai ki compounding ke hisab se portfolio saal-dar-saal kis average dar se badha." },
  { kind: "mcq", id: "m22", topic: "Mutual Funds", difficulty: "advanced", question: "Direct Plan vs Regular Plan of Mutual Fund me main difference?", options: ["Direct plan me distributor commission nahi hota, isiliye return ~1% zyada hota hai", "Regular plan direct government se milta hai", "Direct plan me koi market risk nahi hota"], correctIndex: 0, explanation: "Direct plan me koi agent commission nahi lagta — lower expense ratio se 20-25 saal me lakhs ka extra corpus banta hai." },
  { kind: "mcq", id: "m23", topic: "Diversification", difficulty: "advanced", question: "Portfolio rebalancing ka sabse bada fayda kya hai?", options: ["Har trade par profit double ho jata hai", "Disciplined risk control — automatically high par profit book aur low par buy hota hai", "Capital gain tax zero ho jata hai"], correctIndex: 1, explanation: "Rebalancing se portfolio ka risk level maintain rahta hai — bhagi hui asset se profit book hokar sasti asset me jata hai." },
  { kind: "mcq", id: "m24", topic: "Tax", difficulty: "advanced", question: "Equity investments par short-term capital gains (STCG) tax rate kya hai?", options: ["Flat 20%", "Flat 10%", "Tax-free hota hai"], correctIndex: 0, explanation: "Budget 2024 ke naye rules ke hisab se Listed Equity par STCG (1 saal se kam) 20% ho gaya hai." },
];

export const SCENARIOS: Scenario[] = [
  { kind: "scenario", id: "s1", topic: "Risk", difficulty: "beginner", title: "Market crash — kya karoge?", situation: "Tumhari ₹10,000/month wali SIP 2 saal se chal rahi hai. Achanak market 20% gir gaya aur tumhara portfolio ₹50,000 neeche dikha raha hai. News me sab 'aur girega' bol rahe hain.", prompt: "Tum kya karoge — SIP band karoge, continue rakhoge, ya aur invest karoge? Apna reason likho.", keywords: ["continue", "sip", "long term", "average", "units", "cheap", "saste", "hold", "discipline", "dont panic", "patience"], redFlags: ["band kar", "nikal lo", "sell all", "sab bech", "panic"], ideal: "SIP continue rakhna — crash me saste NAV par zyada units milte hain, aur long-term me market recover karta hai. Panic sell se temporary loss permanent ban jata hai.", hint: "Soch: crash me units saste milte hain ya mehenge?" },
  { kind: "scenario", id: "s2", topic: "SIP", difficulty: "beginner", title: "₹10,000 kahan lagao?", situation: "Tumhare paas har mahine ₹10,000 bachata hai. Tumhe 10 saal baad ghar ke liye paise chahiye. Bank FD 6% de raha hai, ek dost bol raha hai 'ek hi stock me daal, 2x hoga'.", prompt: "Tum ₹10,000 ka kya karoge aur kyun? Apna plan likho.", keywords: ["sip", "mutual fund", "diversif", "long term", "index", "flexi", "emergency", "goal"], redFlags: ["ek hi stock", "sab ek", "tip", "guarantee", "2x"], ideal: "10 saal ka goal hai to diversified equity SIP (index/flexi-cap) best hai, saath me emergency fund alag rakho. Ek stock me sab daalna gambling hai.", hint: "10 saal lamba time hai — ek stock vs diversified fund?" },
  { kind: "scenario", id: "s3", topic: "Emergency Fund", difficulty: "beginner", title: "Job chali gayi — ab kya?", situation: "Tumhare paas ₹2 lakh shares me hai aur bank me sirf ₹20,000 hai. Achanak job chali gayi. Agle 3 mahine ka kharcha ₹1.5 lakh hai.", prompt: "Is situation se kya seekha? Aage se apna paisa kaise manage karoge? Likho.", keywords: ["emergency fund", "3-6 month", "liquid", "fd", "savings", "separate", "alag"], redFlags: ["loan", "credit card", "shares bech"], ideal: "Pehle 3-6 mahine ka emergency fund banao — liquid/FD me, shares me nahi. Invest tab karo jab emergency fund ready ho.", hint: "Emergency ke paise kahan hone chahiye — shares me ya bank me?" },
  { kind: "scenario", id: "s4", topic: "Stocks", difficulty: "intermediate", title: "Tip wala stock — loge ya nahi?", situation: "Ek WhatsApp group me 'guaranteed 50% in 1 month' wala stock tip aaya hai. Stock ka naam suna bhi nahi hai. Tumhare dost ne ₹50,000 daal diye.", prompt: "Tum kya karoge? Tip par invest karna sahi hai ya galat — reason ke saath likho.", keywords: ["research", "fundamental", "risk", "diversif", "tip", "guarantee", "scam", "verify"], redFlags: ["le lo", "daal do", "guaranteed", "fomo"], ideal: "Tip par blind invest mat karo. Company ka business, profit, debt check karo. Guaranteed return ka vaada aksar scam hota hai.", hint: "Guaranteed return ka vaada kis taraf ishara karta hai?" },
  { kind: "scenario", id: "s5", topic: "Mutual Funds", difficulty: "intermediate", title: "Fund change karein ya nahi?", situation: "Tumhara equity fund pichle 1 saal me 5% gira hai, jabki uska benchmark 8% upar hai. Tum 3 saal se invest kar rahe ho. Ek naya fund pichle saal 30% upar gaya hai.", prompt: "Tum fund switch karoge ya rukoge? Apna decision aur reason likho.", keywords: ["long term", "3-5 year", "benchmark", "expense", "consist", "patience", "review"], redFlags: ["turant switch", "naya fund", "past return"], ideal: "1 saal ka underperformance switch ka reason nahi. 3-5 saal ka track, benchmark vs fund, expense ratio dekho — past return future ki guarantee nahi.", hint: "1 saal ka return dekh kar fund badalna sahi hai?" },
  { kind: "scenario", id: "s6", topic: "Compounding", difficulty: "intermediate", title: "25 vs 35 — kaun jeetega?", situation: "A (25 saal): ₹5,000/month SIP, 35 par band, phir kuch nahi. B (35 saal): ₹5,000/month SIP, 55 tak. Dono ko 12% return mile.", prompt: "55 par kiske paas zyada hoga aur kyun? Apne words me samjhao.", keywords: ["compounding", "time", "early", "start", "10 year", "growth"], redFlags: ["b jeetega", "zyada invest"], ideal: "A jeetega — uske paise ko 10 saal zyada compounding mili. Jaldi start karna zyada invest karne se bhi powerful hai.", hint: "Paise ko time kitna mila — ye zyada important hai ya amount?" },
  { kind: "scenario", id: "s7", topic: "Diversification", difficulty: "advanced", title: "Ek sector me sab kuch?", situation: "Tumhara portfolio: 80% ek hi sector (IT) ke stocks me hai. IT sector 30% gir gaya. Tumhara dost bolta hai 'IT hi future hai, aur daalo'.", prompt: "Tum kya karoge? Portfolio ko kaise balance karoge? Likho.", keywords: ["diversif", "sector", "rebalanc", "asset", "gold", "debt", "risk"], redFlags: ["aur daalo", "sab it", "ek sector"], ideal: "Sector concentration risk hai. Rebalance karo — alag sectors, debt aur thoda gold add karo. Ek sector future ho sakta hai, par sab usi me daalna risk hai.", hint: "80% ek sector me — ye diversification hai ya concentration?" },
  { kind: "scenario", id: "s8", topic: "Inflation", difficulty: "advanced", title: "FD vs Equity — 15 saal ka goal", situation: "Tumhe 15 saal baad bachhe ki education ke liye ₹50 lakh chahiye. FD 6% de raha hai, inflation 6% hai. Equity long-term me 11-12% deta raha hai.", prompt: "Tum kahan invest karoge aur kyun? Risk kaise manage karoge? Likho.", keywords: ["inflation", "real return", "equity", "sip", "long term", "goal", "diversif"], redFlags: ["sirf fd", "safe hi"], ideal: "15 saal lamba horizon hai — FD ka real return ~0% hai, goal pura nahi hoga. Diversified equity SIP se inflation-beating return milega; last 2-3 saal me debt me shift karke risk kam karo.", hint: "FD 6% - inflation 6% = real return kitna?" },
  { kind: "scenario", id: "s9", topic: "Tax", difficulty: "advanced", title: "Har mahine profit book karein?", situation: "Tum har mahine stocks bech kar profit book karte ho — 'profit to profit hai'. Har trade par STCG tax 20% aur brokerage lagta hai.", prompt: "Ye strategy sahi hai ya galat? Long-term hold se compare karke likho.", keywords: ["ltcg", "tax", "long term", "compound", "brokerage", "hold", "12.5"], redFlags: ["har mahine becho", "profit book"], ideal: "Frequent selling par 20% STCG + brokerage compounding ko kha jata hai. Long-term hold par LTCG 12.5% (₹1.25L exemption) lagta hai aur compounding chalne deti hai.", hint: "STCG 20% vs LTCG 12.5% — kaunsa sasta hai?" },
  { kind: "scenario", id: "s10", topic: "SIP", difficulty: "beginner", title: "Pehle kharcha ya pehle saving?", situation: "Salary account me aate hi weekend shopping, dining aur online orders me aadhi salary chali jati hai. Mahine ke end me invest karne ke liye kuch nahi bachta.", prompt: "'Pay yourself first' ka rule kya hai? Tum salary aane par sabse pehla step kya uthaoge?", keywords: ["pay yourself first", "sip", "save first", "salary", "budget", "emergency", "automate"], redFlags: ["end me bachha", "pehle kharch", "baad me dekhenge"], ideal: "Pay yourself first: Salary aate hi pehle SIP auto-debit aur emergency fund alag karo, bache hue paise se kharche plan karo.", hint: "Spend after saving ya save after spending?" },
  { kind: "scenario", id: "s11", topic: "Mutual Funds", difficulty: "intermediate", title: "Full-time job aur direct stocks", situation: "Tum 9 to 6 IT job karte ho. Dost bolta hai 'Index fund slow hai, roz 5-6 stocks research karke direct khareedo'.", prompt: "Kya tum direct stock picking karoge ya mutual fund / index fund? Reason ke saath batao.", keywords: ["time", "research", "index", "mutual fund", "diversif", "job", "passive", "fund manager"], redFlags: ["roz trade", "tips le lo", "direct sab"], ideal: "Job ke saath deep research mushkil hai. Index/Mutual Fund professional management aur automatic diversification dete hain, time bhi bachta hai.", hint: "Direct stock me quarterly results aur balance sheet padhne ka time hai?" },
  { kind: "scenario", id: "s12", topic: "Risk", difficulty: "advanced", title: "All-time high par SIP pause?", situation: "Market lagatar 6 mahine se bhaag raha hai aur All-Time High par hai. WhatsApp groups bol rahe hain 'market mehanga hai, SIP pause kar do jab girega tab lagana'.", prompt: "Kya all-time high par SIP pause karni chahiye? Market timing par apna view likho.", keywords: ["continue", "timing", "impossible", "discipline", "long term", "average", "all time high"], redFlags: ["pause kar do", "rok lo", "top par becho", "market time"], ideal: "Market timing kisi ke bas me nahi hai. All-time high ke baad bhi market aur upar ja sakta hai. Disciplined SIP continue rakhna hi wealth banata hai.", hint: "Market kab girega aur kab uthega, kya ye predict karna sambhav hai?" },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickTest(difficulty: Difficulty): Question[] {
  const matchMcqPool = shuffle(MCQS.filter((m) => m.difficulty === difficulty));
  const otherMcqPool = shuffle(MCQS.filter((m) => m.difficulty !== difficulty));
  const selectedMcqs = [...matchMcqPool, ...otherMcqPool].slice(0, 7);

  // Randomize option positions to remove position bias (Option B predominance)
  const mcqs = selectedMcqs.map((m) => {
    const correctOpt = m.options[m.correctIndex];
    const shuffledOpts = shuffle([...m.options]) as [string, string, string];
    const newCorrectIndex = shuffledOpts.indexOf(correctOpt) as 0 | 1 | 2;
    return {
      ...m,
      options: shuffledOpts,
      correctIndex: newCorrectIndex,
    };
  });

  const matchScPool = shuffle(SCENARIOS.filter((s) => s.difficulty === difficulty));
  const otherScPool = shuffle(SCENARIOS.filter((s) => s.difficulty !== difficulty));
  const scs = [...matchScPool, ...otherScPool].slice(0, 3);

  // Mix: MCQ first 7 in order, scenarios interleaved at positions 4, 7, 10
  const out: Question[] = [];
  const mcqQueue = [...mcqs];
  const scQueue = [...scs];
  for (let i = 0; i < 10; i++) {
    if ((i === 3 || i === 6 || i === 9) && scQueue.length) out.push(scQueue.shift()!);
    else if (mcqQueue.length) out.push(mcqQueue.shift()!);
  }
  return out;
}

export const TOPICS: Topic[] = ["SIP", "Mutual Funds", "Stocks", "Risk", "Compounding", "Inflation", "Diversification", "Emergency Fund", "Tax"];
