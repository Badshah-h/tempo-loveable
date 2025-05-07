import apiService from "../api/api";
import { AUTH_ENDPOINTS } from "../api/config";

export interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
  // add more fields as necessary
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// Authenticated login
export const login = async (
  email: string,
  password: string,
  rememberMe: boolean = false,
): Promise<User & { token: string }> => {
  try {
    // Ensure CSRF token is fetched before login attempt
    await apiService.fetchCsrfToken();

    // Make the POST request
    const response = await apiService.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
      remember_me: rememberMe,
    });

    // The backend returns { message, user, token }
    // We need to merge the user object with the token
    const { user, token } = response;

    // Store token using tokenService instead of directly in localStorage
    // This allows for proper handling of remember me functionality
    const tokenService = await import("./tokenService").then((m) => m.default);
    tokenService.setToken(token, rememberMe);

    return { ...user, token };
  } catch (error) {
    console.error("Login error:", error);

    // Log more details about the error
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("Login error details:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
    }

    throw error;
  }
};

// Authenticated logout
export const logout = async (): Promise<void> => {
  try {
    // Attempt to call the logout endpoint
    await apiService.post(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error("Logout API call failed:", error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear token using tokenService
    const tokenService = await import("./tokenService").then((m) => m.default);
    tokenService.clearToken();
  }
};

// Fetch current user info
export const getUser = async (): Promise<User> => {
  return await apiService.get<User>(AUTH_ENDPOINTS.CURRENT_USER);
};

// Alias getUser as getCurrentUser for compatibility with useAuth.tsx
export const getCurrentUser = getUser;

// Register a new user
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  organization?: string;
  termsAccepted?: boolean;
}): Promise<User> => {
  try {
    // Ensure CSRF token is fetched before registration attempt
    await apiService.fetchCsrfToken();

    // Make the POST request
    const response = await apiService.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      userData,
    );

    // If registration returns a token, store it using tokenService
    if (response.token) {
      const tokenService = await import("./tokenService").then(
        (m) => m.default,
      );
      tokenService.setToken(response.token, false); // Default to session storage for new registrations
      return { ...response.user, token: response.token };
    }

    return response.user;
  } catch (error) {
    console.error("Registration error:", error);

    // Log more details about the error
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("Registration error details:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
    }

    throw error;
  }
};

// Alias register as signup for compatibility with useAuth.tsx
export const signup = register;
