import { useState, useEffect } from "react";
import { useAuth } from "../store/authStore";
import API from "../api/axios";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
];

function SettingsModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account"); // "account" or "language"
  const [subView, setSubView] = useState("list"); // "list", "editName", "editEmail", "changePassword"
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("preferredLanguage") || "en"
  );

  // Initialize input fields when view changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
  }, [subView, user, isOpen]);

  if (!isOpen) return null;

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Name cannot be empty");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await API.put("/auth/update-profile", {
        name: name.trim(),
        email: user.email,
      });
      setUser(response.data.user);
      toast.success("Name updated successfully!");
      setSubView("list");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Email cannot be empty");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await API.put("/auth/update-profile", {
        name: user.name,
        email: email.trim(),
      });
      setUser(response.data.user);
      toast.success("Email updated successfully!");
      setSubView("list");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await API.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success(response.data.message || "Password updated successfully!");
      setSubView("list");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLanguage = (langCode) => {
    setCurrentLang(langCode);
    const cookieValue = `/en/${langCode}`;
    
    // Set cookie for Google Translate
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;
    
    localStorage.setItem("preferredLanguage", langCode);
    
    toast.success("Applying translation...");
    
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl h-[min(90vh,600px)] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <svg className="size-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </h2>
            </div>
            
            <nav className="space-y-1.5">
              <button
                onClick={() => { setActiveTab("account"); setSubView("list"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "account"
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </button>

              <button
                onClick={() => { setActiveTab("language"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "language"
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19" />
                </svg>
                Language
              </button>
            </nav>
          </div>
          
          <div className="hidden md:block">
            <p className="text-xs text-slate-500 font-semibold">ATS Intelligence Studio</p>
            <p className="text-[10px] text-slate-600 font-medium">v1.2.0</p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 p-6 md:p-8 overflow-y-auto">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold flex items-center gap-2">
              <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {activeTab === "account" && (
            <div className="flex-1 flex flex-col justify-start">
              {subView === "list" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">General</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      You can manage your account profile details and authentication settings.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/30 overflow-hidden divide-y divide-slate-800">
                    
                    {/* LeetCode ID / Name */}
                    <div 
                      onClick={() => setSubView("editName")}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</p>
                          <p className="text-sm font-extrabold text-slate-200 mt-0.5">{user?.name || "Not set"}</p>
                        </div>
                      </div>
                      <svg className="size-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Email */}
                    <div 
                      onClick={() => setSubView("editEmail")}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</p>
                          <p className="text-sm font-extrabold text-slate-200 mt-0.5">{user?.email || "Not set"}</p>
                        </div>
                      </div>
                      <svg className="size-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Password */}
                    <div 
                      onClick={() => setSubView("changePassword")}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</p>
                          <p className="text-sm font-extrabold text-slate-200 mt-0.5">••••••••</p>
                        </div>
                      </div>
                      <svg className="size-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                  </div>
                </div>
              )}

              {/* Edit Name Sub-view */}
              {subView === "editName" && (
                <form onSubmit={handleUpdateName} className="space-y-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="text-lg font-black text-white">Edit Name</h3>
                      <p className="text-xs font-semibold text-slate-400">Update your display name.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                      placeholder="Enter your name"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 text-white rounded-xl font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-950/20 transition cursor-pointer"
                    >
                      {isLoading && (
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      disabled={isLoading}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold py-3 text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Email Sub-view */}
              {subView === "editEmail" && (
                <form onSubmit={handleUpdateEmail} className="space-y-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="text-lg font-black text-white">Edit Email</h3>
                      <p className="text-xs font-semibold text-slate-400">Update your account email address.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                      placeholder="Enter email address"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 text-white rounded-xl font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-950/20 transition cursor-pointer"
                    >
                      {isLoading && (
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      disabled={isLoading}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold py-3 text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Sub-view */}
              {subView === "changePassword" && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="text-lg font-black text-white">Change Password</h3>
                      <p className="text-xs font-semibold text-slate-400">Validate against database and change password.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Old Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                      placeholder="Enter old password"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                      placeholder="Minimum 6 characters"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                      placeholder="Repeat new password"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 text-white rounded-xl font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-950/20 transition cursor-pointer"
                    >
                      {isLoading && (
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView("list")}
                      disabled={isLoading}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold py-3 text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "language" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Language Settings</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Select your preferred language. The entire website interface will automatically translate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => {
                  const isActive = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition cursor-pointer ${
                        isActive
                          ? "border-sky-500 bg-sky-500/10 text-white font-extrabold shadow-lg shadow-sky-950/25"
                          : "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-slate-700 hover:bg-slate-800/15"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-extrabold">{lang.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{lang.nativeName}</p>
                      </div>
                      
                      {isActive ? (
                        <span className="size-6 grid place-items-center bg-sky-500 text-slate-950 rounded-full text-xs font-black">
                          ✓
                        </span>
                      ) : (
                        <span className="size-6 rounded-full border border-slate-800"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  <strong>💡 Pro-tip:</strong> Page translations are powered dynamically by the Google Translate Web Engine, ensuring that all custom AI-generated resume suggestions are translated correctly as well.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
      
      {/* Dynamic Keyframes and CSS injection for Modal Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default SettingsModal;
