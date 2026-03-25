const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Log resolved API URL at module load to help debug routing problems
if (typeof window !== "undefined") {
    try {
        // eslint-disable-next-line no-console
        console.debug("[api] Using API_URL=", API_URL);
    } catch (e) { }
}

/**
 * Central API client for all frontend↔backend communication.
 * Automatically attaches JWT token from localStorage.
 */

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("shelves_token");
}

async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let res: Response;
    const requestUrl = `${API_URL}${endpoint}`;
    try {
        // eslint-disable-next-line no-console
        console.debug(`[api] ${options.method || 'GET'} ${requestUrl}`);
        res = await fetch(requestUrl, {
            ...options,
            headers,
        });
    } catch (err) {
        throw new Error("Network error: Could not reach the server.");
    }

    const contentType = res.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
        try {
            data = await res.json();
        } catch (err) {
            const text = await res.text();
            console.error("Malformed JSON response:", text);
            throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
        }
    } else {
        const text = await res.text();
        console.warn("Expected JSON but received non-JSON response:", text);
        // Include the response text in the thrown error to aid debugging (truncated)
        const snippet = text ? text.substring(0, 500) : "";
        throw new Error(`API Error: Received unexpected response format (${res.status}): ${snippet} -- Requested URL: ${requestUrl}`);
    }

    if (!res.ok) {
        const error = new Error(data.message || `API Error: ${res.statusText}`);
        (error as any).status = res.status;
        (error as any).data = data;
        throw error;
    }

    return data as T;
}

export function apiGet<T = any>(endpoint: string) {
    return apiFetch<T>(endpoint, { method: "GET" });
}

export function apiPost<T = any>(endpoint: string, body: any) {
    return apiFetch<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export function apiPut<T = any>(endpoint: string, body: any) {
    return apiFetch<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export function apiPatch<T = any>(endpoint: string, body: any) {
    return apiFetch<T>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
}

export function apiDelete<T = any>(endpoint: string) {
    return apiFetch<T>(endpoint, { method: "DELETE" });
}

// Auth helpers
export function setToken(token: string) {
    localStorage.setItem("shelves_token", token);
}

export function removeToken() {
    localStorage.removeItem("shelves_token");
}

export function hasToken(): boolean {
    return !!getToken();
}
