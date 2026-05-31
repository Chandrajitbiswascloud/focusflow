import React, { useState, useEffect, useRef } from 'react';
import { CoinIcon, UnlockIcon, CheckIcon } from './components/Icons';

const API_URL = 'http://localhost:5000/api';

const App = () => {
  // Auth States
  const [token, setToken] = useState(() => localStorage.getItem("ff_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ff_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");

  // Economy States
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem("ff_credits");
    return saved ? parseInt(saved, 10) : 35;
  });

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("ff_xp");
    return saved ? parseInt(saved, 10) : 120;
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("ff_habits");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Study/Focus for 1 hour", reward: 20, category: "study", completedToday: false },
      { id: 2, title: "Workout/Exercise 30 mins", reward: 15, category: "fitness", completedToday: false },
      { id: 3, title: "Drink 3L Water", reward: 5, category: "health", completedToday: true },
      { id: 4, title: "Read book for 20 mins", reward: 10, category: "mind", completedToday: false }
    ];
  });

  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem("ff_rewards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(item => {
          if (item.expiresAt) {
            const timeLeft = Math.max(0, Math.floor((new Date(item.expiresAt).getTime() - Date.now()) / 1000));
            return { ...item, activeTimeLeft: timeLeft };
          }
          return item;
        });
      } catch(e) {}
    }
    return [
      { id: "insta", title: "Instagram Access", cost: 15, duration: 15, type: "app", icon: "📱", activeTimeLeft: 0, appIdentifier: "com.instagram.android" },
      { id: "yt", title: "YouTube Video", cost: 20, duration: 20, type: "app", icon: "📺", activeTimeLeft: 0, appIdentifier: "com.google.android.youtube" },
      { id: "gaming", title: "PC/Console Gaming", cost: 50, duration: 60, type: "leisure", icon: "🎮", activeTimeLeft: 0, appIdentifier: "com.steam.android" },
      { id: "pizza", title: "Snack / Cheat Meal", cost: 45, duration: null, type: "physical", icon: "🍕", activeTimeLeft: 0, appIdentifier: "custom.reward.cheatmeal" }
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("ff_transactions");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Completed: Drink 3L Water", change: 5, type: "earn", timestamp: "Today, 10:30 AM" },
      { id: 2, title: "Starting Balance bonus", change: 30, type: "earn", timestamp: "Today, 08:00 AM" }
    ];
  });

  // Pomodoro Timer States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState("Focus"); // "Focus" or "Break"

  // Form States
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitReward, setNewHabitReward] = useState(10);
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardCost, setNewRewardCost] = useState(20);
  const [newRewardDuration, setNewRewardDuration] = useState(15);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  // Helper for authenticating fetches
  const fetchWithAuth = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      throw new Error('Authentication expired. Switched to Local Offline Mode.');
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Server request failed');
    return data;
  };

  // Server Data Synchronizer
  const syncFromServer = async () => {
    if (!token) return;
    try {
      // 1. Fetch Profile
      const profileData = await fetchWithAuth('/auth/me');
      setCredits(profileData.profile.creditBalance);
      setXp(profileData.profile.currentXp);

      // 2. Fetch Habits
      const habitsData = await fetchWithAuth('/habits');
      setHabits(habitsData.habits);

      // 3. Fetch Transactions
      const txData = await fetchWithAuth('/transactions');
      setTransactions(txData.transactions.map(tx => ({
        id: tx.id,
        title: tx.title,
        change: tx.change,
        type: tx.type,
        timestamp: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
      })));

      // 4. Fetch Active Unlocks
      const unlocksData = await fetchWithAuth('/rewards/active');
      const activeMap = {};
      unlocksData.activeUnlocks.forEach(unlock => {
        const timeLeftSeconds = Math.max(0, Math.floor((new Date(unlock.expiresAt).getTime() - Date.now()) / 1000));
        activeMap[unlock.appIdentifier] = {
          timeLeftSeconds,
          expiresAt: unlock.expiresAt
        };
      });

      setRewards(prev => prev.map(item => {
        const activeInfo = activeMap[item.appIdentifier];
        if (activeInfo) {
          return { 
            ...item, 
            activeTimeLeft: activeInfo.timeLeftSeconds,
            expiresAt: activeInfo.expiresAt
          };
        }
        return { ...item, activeTimeLeft: 0, expiresAt: null };
      }));

      triggerToast("Synced state with FocusFlow Cloud server.", "success");
    } catch (error) {
      console.warn(error.message);
      triggerToast(error.message, "error");
    }
  };

  // Sync on Mount & Token change
  useEffect(() => {
    if (token) {
      syncFromServer();
    }
  }, [token]);

  // Save offline states fallback
  useEffect(() => {
    if (!token) {
      localStorage.setItem("ff_credits", credits);
      localStorage.setItem("ff_xp", xp);
      localStorage.setItem("ff_habits", JSON.stringify(habits));
      localStorage.setItem("ff_transactions", JSON.stringify(transactions));
    }
  }, [credits, xp, habits, transactions, token]);

  // Sync rewards and active local unlocks for blocker extension
  useEffect(() => {
    localStorage.setItem("ff_rewards", JSON.stringify(rewards));
    
    const activeUnlocks = rewards
      .filter(r => r.activeTimeLeft && r.activeTimeLeft > 0)
      .map(r => ({
        appIdentifier: r.appIdentifier,
        expiresAt: r.expiresAt || new Date(Date.now() + r.activeTimeLeft * 1000).toISOString()
      }));
    
    const currentUnlocksStr = JSON.stringify(activeUnlocks);
    if (localStorage.getItem("ff_local_unlocks") !== currentUnlocksStr) {
      localStorage.setItem("ff_local_unlocks", currentUnlocksStr);
      window.postMessage({ type: "FOCUSFLOW_SYNC" }, "*");
    }
  }, [rewards]);

  // Show toast helper
  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === "register") {
        const registerData = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword, displayName: authDisplayName })
        }).then(r => r.json());

        if (!registerData.success) throw new Error(registerData.error);
        
        localStorage.setItem("ff_token", registerData.token);
        localStorage.setItem("ff_user", JSON.stringify(registerData.user));
        setToken(registerData.token);
        setUser(registerData.user);
      } else {
        const loginData = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        }).then(r => r.json());

        if (!loginData.success) throw new Error(loginData.error);

        localStorage.setItem("ff_token", loginData.token);
        localStorage.setItem("ff_user", JSON.stringify(loginData.user));
        setToken(loginData.token);
        setUser(loginData.user);
      }
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthDisplayName("");
    } catch (error) {
      triggerToast(error.message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ff_token");
    localStorage.removeItem("ff_user");
    setToken(null);
    setUser(null);
    triggerToast("Switched back to Local Offline Mode.");
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            handleTimerComplete();
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  // Active Unlocks Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRewards(prev => {
        let updated = false;
        const nextRewards = prev.map(item => {
          if (item.activeTimeLeft && item.activeTimeLeft > 0) {
            updated = true;
            return { ...item, activeTimeLeft: item.activeTimeLeft - 1 };
          }
          return item;
        });
        return updated ? nextRewards : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimerComplete = async () => {
    setIsTimerRunning(false);
    if (timerType === "Focus") {
      const rewardCredits = 15;
      const xpGain = 30;

      if (token) {
        try {
          const res = await fetchWithAuth('/focus/complete', { method: 'POST' });
          setCredits(res.profile.creditBalance);
          setXp(res.profile.currentXp);
          await syncFromServer();
          triggerToast(`Great job! You earned ${rewardCredits} Credits and ${xpGain} XP!`, "earn");
        } catch (error) {
          triggerToast("Server connection failed. Timer credited locally.", "error");
          localCompleteTimer(rewardCredits, xpGain);
        }
      } else {
        localCompleteTimer(rewardCredits, xpGain);
      }
      setTimerMinutes(5); // Switch to 5 min break
      setTimerType("Break");
    } else {
      triggerToast("Break finished! Time to focus.", "success");
      setTimerMinutes(25);
      setTimerType("Focus");
    }
  };

  const localCompleteTimer = (rewardCredits, xpGain) => {
    setCredits(prev => prev + rewardCredits);
    setXp(prev => prev + xpGain);
    addTransaction(`Completed Focus Session`, rewardCredits, "earn");
    triggerToast(`Great job! You earned ${rewardCredits} Credits and ${xpGain} XP!`, "earn");
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    triggerToast("Focus timer started! Avoid distractions.", "info");
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(timerType === "Focus" ? 25 : 5);
    setTimerSeconds(0);
  };

  const fastForwardTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(0);
    setTimerSeconds(3);
    setIsTimerRunning(true);
    triggerToast("Fast-forwarding to completion...", "info");
  };

  // Transaction log helper (Offline fallback)
  const addTransaction = (title, amount, type) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const newTx = {
      id: Date.now(),
      title,
      change: amount,
      type,
      timestamp: timeStr
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
  };

  // Complete Habit
  const toggleHabit = async (id) => {
    if (token) {
      try {
        const res = await fetchWithAuth(`/habits/${id}/complete`, { method: 'POST' });
        setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: res.completedToday } : h));
        setCredits(res.profile.creditBalance);
        setXp(res.profile.currentXp);
        const txData = await fetchWithAuth('/transactions');
        setTransactions(txData.transactions.map(tx => ({
          id: tx.id,
          title: tx.title,
          change: tx.change,
          type: tx.type,
          timestamp: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
        })));
        triggerToast(res.completedToday ? `Completed Habit!` : `Unchecked Habit!`, res.completedToday ? "earn" : "spend");
      } catch (error) {
        triggerToast(error.message, "error");
      }
    } else {
      // Local fallback
      setHabits(prev => prev.map(habit => {
        if (habit.id === id) {
          const nextState = !habit.completedToday;
          if (nextState) {
            setCredits(c => c + habit.reward);
            setXp(x => x + habit.reward * 1.5);
            addTransaction(`Completed: ${habit.title}`, habit.reward, "earn");
            triggerToast(`Completed Habit! +${habit.reward} Credits`, "earn");
          } else {
            setCredits(c => Math.max(0, c - habit.reward));
            setXp(x => Math.max(0, x - habit.reward * 1.5));
            addTransaction(`Unchecked: ${habit.title}`, habit.reward, "spend");
          }
          return { ...habit, completedToday: nextState };
        }
        return habit;
      }));
    }
  };

  // Spend Credits / Unlock Reward
  const buyReward = async (id) => {
    const reward = rewards.find(r => r.id === id);
    if (!reward) return;

    if (credits < reward.cost) {
      triggerToast(`Insufficient credits! You need ${reward.cost - credits} more.`, "error");
      return;
    }

    if (token) {
      try {
        const res = await fetchWithAuth('/rewards/unlock', {
          method: 'POST',
          body: JSON.stringify({
            appIdentifier: reward.appIdentifier,
            cost: reward.cost,
            durationMinutes: reward.duration || 60,
            title: reward.title
          })
        });
        
        setCredits(res.profile.creditBalance);
        await syncFromServer();
        triggerToast(`Successfully unlocked ${reward.title}!`, "spend");
      } catch (error) {
        triggerToast(error.message, "error");
      }
    } else {
      // Local offline logic
      setCredits(c => c - reward.cost);
      addTransaction(`Unlocked: ${reward.title}`, reward.cost, "spend");
      triggerToast(`Successfully unlocked ${reward.title}!`, "spend");

      if (reward.duration) {
        setRewards(prev => prev.map(item => {
          if (item.id === id) {
            const currentGainedSeconds = (item.activeTimeLeft || 0) + (reward.duration * 60);
            return { 
              ...item, 
              activeTimeLeft: currentGainedSeconds,
              expiresAt: new Date(Date.now() + currentGainedSeconds * 1000).toISOString()
            };
          }
          return item;
        }));
      }
    }
  };

  // Add custom habit
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    if (token) {
      try {
        const res = await fetchWithAuth('/habits', {
          method: 'POST',
          body: JSON.stringify({ title: newHabitTitle, reward: parseInt(newHabitReward, 10) })
        });
        setHabits(prev => [...prev, res.habit]);
        triggerToast(`Added custom habit: ${res.habit.title}`);
      } catch (error) {
        triggerToast(error.message, "error");
      }
    } else {
      const newHabit = {
        id: Date.now(),
        title: newHabitTitle,
        reward: parseInt(newHabitReward, 10) || 5,
        category: "custom",
        completedToday: false
      };
      setHabits(prev => [...prev, newHabit]);
      triggerToast(`Added new habit: ${newHabit.title}`);
    }

    setNewHabitTitle("");
    setShowAddHabitModal(false);
  };

  // Add custom reward
  const handleAddReward = (e) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;

    const newReward = {
      id: Date.now().toString(),
      title: newRewardTitle,
      cost: parseInt(newRewardCost, 10) || 10,
      duration: parseInt(newRewardDuration, 10) || null,
      type: "custom",
      icon: "🎁",
      activeTimeLeft: 0,
      appIdentifier: `custom.reward.${newRewardTitle.toLowerCase().replace(/\s+/g, '')}`
    };

    setRewards(prev => [...prev, newReward]);
    setNewRewardTitle("");
    setShowAddRewardModal(false);
    triggerToast(`Added custom reward: ${newReward.title}`);
  };

  // Formatting helper
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Progress logic
  const level = Math.floor(xp / 100) + 1;
  const progressToNextLevel = xp % 100;

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8 relative z-10 flex flex-col justify-between max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-obsidian-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center font-heading font-bold text-xl text-white">
            F
          </div>
          <div>
            <h1 className="font-heading font-semibold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FocusFlow
            </h1>
            <p className="text-xs text-slate-500 font-body">The Focus & Habit Economy</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-medium">● Connected as {user.displayName}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] bg-slate-805 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded-lg"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1.5"
              >
                ☁ Connect Account
              </button>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-body">Level {level} Focus Master</span>
            <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-violet-500 h-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-505 mt-0.5">{progressToNextLevel}/100 XP to Level {level + 1}</span>
          </div>

          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl border-violet-500/20">
            <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold coin-glow">
              ¢
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Credits</span>
              <span className="text-lg font-heading font-bold text-violet-400 leading-tight">{credits}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Block: Habits, Timer */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Pomodoro Timer Box */}
          <section className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                {timerType} Session
              </span>
              <h2 className="font-heading font-medium text-xl text-white mt-3">Daily Focus Work</h2>
              <p className="text-sm text-slate-400 font-light mt-1 max-w-[28ch]">
                Complete 25 minutes of deep work to claim 15 Focus Credits. Leaving this tab breaks the session.
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                {isTimerRunning ? (
                  <button 
                    onClick={pauseTimer}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 active:scale-95"
                  >
                    Pause Focus
                  </button>
                ) : (
                  <button 
                    onClick={startTimer}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-emerald-500/10 active:scale-95"
                  >
                    Start Focus
                  </button>
                )}
                
                <button 
                  onClick={resetTimer}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-300"
                >
                  Reset
                </button>

                <button 
                  onClick={fastForwardTimer}
                  title="Simulate session end (For Demo)"
                  className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
                >
                  ⚡ Test End
                </button>
              </div>
            </div>

            {/* Big Clock UI */}
            <div className="flex-shrink-0 relative flex items-center justify-center h-44 w-44 rounded-full border border-slate-800/80 bg-slate-900/30">
              <div className={`absolute inset-0.5 rounded-full border-2 ${isTimerRunning ? 'border-emerald-500/30 border-t-emerald-500' : 'border-slate-800'} animate-spin`} style={{ animationDuration: '4s' }}></div>
              <div className="text-center z-10">
                <span className="font-heading font-bold text-4xl tracking-tight text-white block">
                  {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-505 uppercase tracking-widest font-semibold mt-1 block">
                  {isTimerRunning ? "Deep Focus" : "Paused"}
                </span>
              </div>
            </div>
          </section>

          {/* Habits Board */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading font-medium text-xl text-white">Daily Discipline Habits</h2>
                <p className="text-xs text-slate-400 font-light mt-0.5">Complete habits to earn Focus Credits.</p>
              </div>
              <button 
                onClick={() => setShowAddHabitModal(true)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all duration-300 active:scale-95"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    habit.completedToday 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : 'bg-slate-900/40 border-obsidian-border hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                        habit.completedToday 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-slate-700 hover:border-slate-505 text-transparent'
                      }`}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <div>
                      <span className={`text-sm font-medium ${habit.completedToday ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {habit.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-600 block mt-0.5 tracking-wider">{habit.category || 'custom'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-xl">
                    <span className="text-xs font-semibold">+{habit.reward}</span>
                    <CoinIcon className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Block: Reward Shop, Screen Time Block */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Distraction Reward Shop */}
          <section className="glass-panel rounded-3xl p-6">
            <div>
              <h2 className="font-heading font-medium text-xl text-white">The Reward Gateway</h2>
              <p className="text-xs text-slate-400 font-light mt-0.5">Spend credits to temporarily unlock distractions.</p>
            </div>

            <div className="flex items-center justify-between mt-4 mb-6">
              <span className="text-xs text-slate-505 text-semibold uppercase">Reward List</span>
              <button 
                onClick={() => setShowAddRewardModal(true)}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                + Custom Reward
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rewards.map((reward) => {
                const isUnlocked = reward.activeTimeLeft && reward.activeTimeLeft > 0;
                return (
                  <div 
                    key={reward.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3 ${
                      isUnlocked 
                        ? 'bg-violet-500/5 border-violet-500/20' 
                        : 'bg-slate-900/40 border-obsidian-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{reward.icon}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{reward.title}</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {reward.duration ? `Duration: ${reward.duration} mins` : "Single Use / Custom Reward"}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => buyReward(reward.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          isUnlocked
                            ? 'bg-violet-600 hover:bg-violet-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95'
                        }`}
                      >
                        <span>{reward.cost} ¢</span>
                      </button>
                    </div>

                    {isUnlocked && (
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-violet-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UnlockIcon className="h-4 w-4 text-violet-400" />
                          <span className="text-xs font-semibold text-violet-400">Unlock Active</span>
                        </div>
                        <span className="text-xs font-mono text-violet-300 font-semibold">
                          {formatTime(reward.activeTimeLeft)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transactions History */}
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="font-heading font-medium text-lg text-white mb-4">Discipline Ledger</h2>
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-900/60">
                  <div>
                    <span className="text-xs font-medium text-slate-202 block">{tx.title}</span>
                    <span className="text-[9px] text-slate-505">{tx.timestamp}</span>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === 'earn' ? 'text-emerald-400' : 'text-violet-400'}`}>
                    {tx.type === 'earn' ? `+${tx.change}` : `-${tx.change}`}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-obsidian-border text-center">
        <p className="text-xs text-slate-500 font-medium font-body mb-1">
          FocusFlow — Built entirely by Chandrajit Biswas
        </p>
        <p className="text-[10px] text-slate-600 font-light font-body">
          Balance your work & leisure scientifically.
        </p>
      </footer>

      {/* AUTHENTICATION DIALOG DRAWER */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg text-white">
                {authMode === "login" ? "Login to FocusFlow" : "Create FocusFlow Account"}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {authMode === "register" && (
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Display Name</label>
                  <input 
                    type="text" 
                    placeholder="Your display name" 
                    value={authDisplayName}
                    onChange={e => setAuthDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all mt-2">
                {authMode === "login" ? "Login" : "Register"}
              </button>

              <div className="text-center mt-3">
                <button 
                  type="button" 
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  {authMode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HABIT MODAL */}
      {showAddHabitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg text-white">Add Custom Habit</h3>
              <button onClick={() => setShowAddHabitModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Habit Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Solve 2 LeetCode problems" 
                  value={newHabitTitle}
                  onChange={e => setNewHabitTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Reward Value (Credits)</label>
                <input 
                  type="number" 
                  min="5" 
                  max="100" 
                  value={newHabitReward}
                  onChange={e => setNewHabitReward(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all mt-2">
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD REWARD MODAL */}
      {showAddRewardModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg text-white">Add Custom Reward</h3>
              <button onClick={() => setShowAddRewardModal(false)} className="text-slate-505 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddReward} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Reward Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Play Valorant session" 
                  value={newRewardTitle}
                  onChange={e => setNewRewardTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Cost (Credits)</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="200" 
                    value={newRewardCost}
                    onChange={e => setNewRewardCost(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Duration (Mins)</label>
                  <input 
                    type="number" 
                    min="5" 
                    placeholder="Leave blank for single-use"
                    value={newRewardDuration}
                    onChange={e => setNewRewardDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-505 text-white font-semibold py-2.5 rounded-xl text-sm transition-all mt-2">
                Create Reward Option
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl text-xs font-semibold z-50 flex items-center gap-2 border shadow-lg transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : toast.type === 'earn'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : toast.type === 'spend'
            ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {toast.type === 'earn' && "✨ "}
          {toast.type === 'spend' && "💸 "}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
