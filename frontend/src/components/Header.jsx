import { Link } from "react-router-dom";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../store/authStore";
import SettingsModal from "./SettingsModal";

const getStoredProfile = () =>
  JSON.parse(localStorage.getItem("profileDetails") || "{}");

const getInitialTheme = () =>
  localStorage.getItem("appearanceTheme") || "light";

function Header() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("overview");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [profileDetails, setProfileDetails] = useState(() => ({
    phone: "",
    gender: "",
    address: "",
    city: "",
    role: "",
    ...getStoredProfile(),
  }));

  const initials = useMemo(() => {
    const name = user?.name || user?.email || "User";

    return name
      .split(/[ @._-]/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("appearanceTheme", theme);
  }, [theme]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileDetails((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem(
      "profileDetails",
      JSON.stringify(profileDetails)
    );
    setIsEditing(false);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
            ATS
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-950">
              ATS Checker AI
            </h1>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">
              Resume intelligence studio
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Home
          </Link>

        {user ? (
          <>
            <Link
              to="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              Dashboard
            </Link>

            <Link
              to="/upload"
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              Upload
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
                  {initials}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  Profile
                </span>
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-200 p-4">
                    <p className="text-base font-black text-slate-950">
                      {user?.name || "Your profile"}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user?.email || "No email added"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2">
                    {["overview", "settings", "appearance"].map((panel) => (
                      <button
                        key={panel}
                        type="button"
                        onClick={() => setActivePanel(panel)}
                        className={`rounded-lg px-2 py-2 text-xs font-black capitalize transition ${
                          activePanel === panel
                            ? "bg-white text-sky-700 shadow-sm"
                            : "text-slate-500 hover:bg-white"
                        }`}
                      >
                        {panel}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[460px] overflow-auto p-4">
                    {activePanel === "overview" ? (
                      <div className="space-y-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Name
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {user?.name || "Not available"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Email
                          </p>
                          <p className="mt-1 break-words font-bold text-slate-900">
                            {user?.email || "Not available"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-2 h-11 w-full rounded-xl bg-rose-600 text-sm font-black text-white hover:bg-rose-700"
                        >
                          Logout
                        </button>
                      </div>
                    ) : null}

                    {activePanel === "appearance" ? (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-700">
                          Choose the app background mode.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {["light", "dark"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setTheme(option)}
                              className={`rounded-xl border p-4 text-left text-sm font-black capitalize transition ${
                                theme === option
                                  ? "border-sky-500 bg-sky-50 text-sky-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {activePanel === "settings" ? (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">
                          Configure your account settings, update your name/email, reset your password, and customize your language preferences.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-black text-white w-full transition flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
                        >
                          <svg className="size-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          </svg>
                          Open Settings Panel
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
            >
              Register
            </Link>
          </>
        )}
        </nav>
      </div>
    </header>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
  </>
  );
}

export default Header;
