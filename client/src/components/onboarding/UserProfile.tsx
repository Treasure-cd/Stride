import { useState, useRef, useEffect } from "react";
import { getAuth } from 'firebase/auth';
import { UNIVERSITIES } from "../../constants/universities";

interface UserProfile {
  setDisplayName: (name: string) => void;
  onNext: () => void;
}

const Step1UserProfile = ({ setDisplayName, onNext }: UserProfile) => {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_PROD_URL

  const filteredUniversities = UNIVERSITIES.filter((uni) =>
    uni.toLowerCase().includes(institution.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const createUser = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
        throw new Error("You must be logged in to create a profile.");
        }
        const token = await currentUser.getIdToken();

        const payload = {
        email: currentUser.email,
        profile: {
            name: name,
            institution: institution,
        },
        };

        const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
        });

        if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save profile data.");
        }

        return await response.json();
    };

  const handleNext = async () => {
    if (!name.trim() || !institution.trim()) {
      setError("Please fill out both your name and your institution.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createUser();
      pendo.track("user_profile_created", {
        institution: institution,
        has_name: Boolean(name.trim())
      })
      setDisplayName(name);
      localStorage.setItem("name", name)
      onNext();
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-semibold text-[#f5f5f5] mb-3">
          Let's build your profile
        </h1>
        <p className="text-[#b0b0b0]">
          Tell us a little bit about yourself so we can personalize Stride.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
            What would you like us to call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-transparent border text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:border-purple-600 transition-colors"
            placeholder="Enter your full name or nickname"
            disabled={isSaving}
          />
        </div>

        {/* Institution Input with Zero-Latency Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
            Where do you study?
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-4 py-3 rounded-lg bg-transparent border text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:border-purple-600 transition-colors"
            placeholder="Search for your university..."
            disabled={isSaving}
            autoComplete="off"
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && institution.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[#080808] border border-[#3d3651] rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {filteredUniversities.length > 0 ? (
                filteredUniversities.map((uni, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInstitution(uni);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#f5f5f5] hover:bg-[#6d28d9]/20 transition-colors border-b border-[#3d3651]/50 last:border-0"
                  >
                    {uni}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#b0b0b0]">
                  No exact matches. Press Next to use "{institution}" anyway.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!name.trim() || !institution.trim() || isSaving}
          className={`w-full py-3.5 bg-[#6d28d9] text-white rounded-lg font-medium transition-all flex justify-center items-center ${
            !name.trim() || !institution.trim() || isSaving
              ? "cursor-not-allowed"
              : "hover:opacity-50"
          }`}
        >
          {isSaving ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step1UserProfile;