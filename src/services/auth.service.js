import { env } from "@/config/env";
import { ROLE_VERIFICATION } from "@/config/roles";
import { http } from "./http";
import { MOCK_USERS, MOCK_VERIFICATION_CODE } from "./mock/users";

const SESSION_KEY = "agrofund.mock.session"; // mock mode only; real mode restores via refresh cookie
const strip = ({ password, ...user }) => user; // eslint-disable-line no-unused-vars
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const issue = (user) => {
  sessionStorage.setItem(SESSION_KEY, user.id);
  return { user: strip(user), accessToken: `mock.${user.id}.${Date.now()}` };
};

const mock = {
  async login({ email, password }) {
    await delay();
    const user = MOCK_USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    const method = ROLE_VERIFICATION[user.role];
    return method ? { requiresVerification: true, method, challengeId: user.id } : issue(user);
  },
  async verify({ challengeId, code }) {
    await delay();
    const user = MOCK_USERS.find((u) => u.id === challengeId);
    if (!user || code !== MOCK_VERIFICATION_CODE) throw new Error("Invalid verification code");
    return issue(user);
  },
  async me() {
    const user = MOCK_USERS.find((u) => u.id === sessionStorage.getItem(SESSION_KEY));
    if (!user) throw new Error("No session");
    return { user: strip(user), accessToken: `mock.${user.id}.${Date.now()}` };
  },
  async logout() { sessionStorage.removeItem(SESSION_KEY); },
};

const remote = {
  login: (body) => http.post("/auth/login", body).then((r) => r.data),
  verify: (body) => http.post("/auth/verify", body).then((r) => r.data),
  me: () => http.post("/auth/refresh").then((r) => r.data),
  logout: () => http.post("/auth/logout"),
};

export const authService = env.useMock ? mock : remote;
