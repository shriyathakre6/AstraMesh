import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  lastLogin?: string;
}

interface StoredAccount {
  user: User;
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'astramesh_auth_session';
const ACCOUNTS_STORAGE_KEY = 'astramesh_registered_accounts';

// Helper to hash password with SHA-256
async function hashPassword(password: string): Promise<string> {
  const salt = 'astramesh_sih26158_salt_';
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_USERS: { user: User; rawPass: string }[] = [
  {
    user: {
      id: 'usr-01',
      name: 'Shriya Thakre',
      email: 'shriyathakre6@gmail.com',
      role: 'Lead Geospatial Scientist',
      organization: 'ISRO Geospatial Intelligence Cell'
    },
    rawPass: 'astramesh2026'
  },
  {
    user: {
      id: 'usr-02',
      name: 'SIH Evaluator',
      email: 'evaluator@sih.gov.in',
      role: 'Senior Jury Member',
      organization: 'Smart India Hackathon 2026'
    },
    rawPass: 'sih2026'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and seed default accounts
  useEffect(() => {
    async function initAuth() {
      try {
        // Seed default accounts if not present
        const existingAccountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (!existingAccountsStr) {
          const seeded: StoredAccount[] = [];
          for (const item of DEFAULT_USERS) {
            const hash = await hashPassword(item.rawPass);
            seeded.push({ user: item.user, passwordHash: hash });
          }
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seeded));
        }

        // Check active session
        const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (sessionStr) {
          const parsedUser = JSON.parse(sessionStr) as User;
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to initialize auth state', e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (
    email: string, 
    password: string, 
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const inputHash = await hashPassword(password);

      const accountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      let accounts: StoredAccount[] = accountsStr ? JSON.parse(accountsStr) : [];

      // Check if user exists
      const match = accounts.find(acc => acc.user.email.toLowerCase() === cleanEmail);
      if (!match) {
        return { success: false, error: 'No account registered with this email address.' };
      }

      if (match.passwordHash !== inputHash) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }

      const activeUser: User = {
        ...match.user,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setUser(activeUser);

      // Persist session
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(activeUser));
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(activeUser));
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanName || cleanName.length < 2) {
        return { success: false, error: 'Please enter a valid full name.' };
      }
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const accountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      let accounts: StoredAccount[] = accountsStr ? JSON.parse(accountsStr) : [];

      if (accounts.some(acc => acc.user.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const hash = await hashPassword(password);
      const newUser: User = {
        id: `usr-${Date.now().toString(36)}`,
        name: cleanName,
        email: cleanEmail,
        role: 'Geospatial Research Officer',
        organization: 'Defense & Space Survey Cell',
        lastLogin: 'Just now'
      };

      accounts.push({ user: newUser, passwordHash: hash });
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

      // Auto login newly registered user
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
