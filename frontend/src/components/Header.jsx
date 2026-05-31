import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../store/authStore";
import SettingsModal from "./SettingsModal";

const getStoredProfile = () =>
  JSON.parse(localStorage.getItem("profileDetails") || "{}");

const getInitialTheme = () =>
  localStorage.getItem("appearanceTheme") || "light";

function Header() {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("overview");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleLogout = () => {
    setIsProfileOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      >
        Home
      </Link>

      {user ? (
        <>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Dashboard
          </Link>

          <Link
            to="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Upload
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
              ATS
            </span>

            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-950">
                ATS Checker AI
              </h1>

              <p className="hidden sm:block text-xs font-semibold text-slate-500">
                Resume intelligence studio
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />

            {user && (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
                    {initials}
                  </span>

                  <span className="hidden lg:inline">
                    Profile
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-200 p-4">
                      <p className="font-black text-slate-950">
                        {user?.name || "Your Profile"}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {user?.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2">
                      {["overview", "settings", "appearance"].map((panel) => (
                        <button
                          key={panel}
                          onClick={() => setActivePanel(panel)}
                          className={`rounded-lg px-2 py-2 text-xs font-black capitalize ${activePanel === panel
                            ? "bg-white text-sky-700 shadow-sm"
                            : "text-slate-500"
                            }`}
                        >
                          {panel}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 max-h-[450px] overflow-y-auto">
                      {activePanel === "overview" && (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500 font-bold uppercase">
                              Name
                            </p>
                            <p className="font-bold">
                              {user?.name || "Not available"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500 font-bold uppercase">
                              Email
                            </p>
                            <p className="break-all font-bold">
                              {user?.email}
                            </p>
                          </div>

                          <button
                            onClick={handleLogout}
                            className="w-full rounded-xl bg-rose-600 py-3 text-white font-black hover:bg-rose-700"
                          >
                            Logout
                          </button>
                        </div>
                      )}

                      {activePanel === "appearance" && (
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-700">
                            Choose Theme
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            {["light", "dark"].map((mode) => (
                              <button
                                key={mode}
                                onClick={() => setTheme(mode)}
                                className={`rounded-xl border p-4 font-bold capitalize ${theme === mode
                                  ? "border-sky-500 bg-sky-50 text-sky-700"
                                  : "border-slate-200"
                                  }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {activePanel === "settings" && (
                        <button
                          onClick={() => {
                            setIsSettingsOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="w-full rounded-xl bg-slate-900 py-3 text-white font-black hover:bg-slate-800"
                        >
                          Open Settings Panel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            aria-label="Toggle menu"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="flex flex-col gap-2 p-4">
              <NavLinks />

              {user && (
                <>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="font-bold">
                      {user?.name}
                    </p>

                    <p className="break-all text-sm text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-xl bg-slate-900 py-3 text-white font-black"
                  >
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-rose-600 py-3 text-white font-black"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default Header;