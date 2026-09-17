import { useState, useRef, useEffect } from "react";
import { getAuth } from 'firebase/auth';
import { UNIVERSITIES } from '../../constants/universities.ts'
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
  setDisplayName: (name: string) => void;
  onNext: () => void;
}

const Step1UserProfile = ({ setDisplayName, onNext }: UserProfile) => {
  const { setDisplayName: setAuthDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_DEV_URL

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

        const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
        });

if (!response.ok) {
    // 1. Get the raw text first to see if it's HTML or JSON
    const errorText = await response.text(); 
    console.log("Raw Server Error Response:", errorText);

    // 2. Try to parse it safely
    let errorMessage = "Failed to save profile data.";
    try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData?.message || errorMessage;
    } catch (e) {
        errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
    }
    
    throw new Error(errorMessage);
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
      setDisplayName(name);
      setAuthDisplayName(name);
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
      <h1 className="text-3xl font-semibold text-(--text-h) mb-3">
        Let's build your profile
      </h1>
      <p className="text-(--text)">
        Tell us a little bit about yourself so we can personalize Stride.
      </p>
    </div>

    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-text-h mb-2">
          What would you like us to call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-transparent border border-(--input-border) text-(--text) placeholder:text-(--text)/50 focus:outline-none focus:border-(--accent) transition-colors"
          placeholder="Enter your full name or nickname"
          disabled={isSaving}
        />
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-text-h mb-2">
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
          className="w-full px-4 py-3 rounded-md bg-transparent border border-(--input-border) text-(--text) placeholder:text-(--text)/50 focus:outline-none focus:border-(--accent) transition-colors"
          placeholder="Enter your school"
          disabled={isSaving}
          autoComplete="off"
        />

        {showDropdown && institution.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-(--bg-elevated) border border-(--border-subtle) rounded-md shadow-xl max-h-60 overflow-y-auto">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((uni, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInstitution(uni);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-(--text) hover:bg-(--accent-bg) transition-colors border-b border-(--border-subtle) last:border-0"
                >
                  {uni}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-(--text) opacity-70">
                No exact matches. Press Next to use "{institution}" anyway.
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="mt-4">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!name.trim() || !institution.trim() || isSaving}
        className="w-full py-3.5 bg-(--accent) text-white rounded-md font-medium transition-all duration-200 ease-in-out flex justify-center items-center disabled:opacity-50 hover:opacity-80 cursor-pointer"
      >
        {isSaving ? 'Saving...' : 'Continue'}
      </button>
    </div>
  </div>
);
};

export default Step1UserProfile;