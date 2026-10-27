# Pine Labs Prepaid — Authorise an Agent

Responsive React + TypeScript + Tailwind CSS implementation of the "Authorise an Agent" flow
(Verify mobile → OTP → Spending limits → Authorised/redirect, plus the "Not a member" sign-up branch).

All data currently comes from an **in-memory mock service**. No real API is called.

## Scripts

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server (shows mock cheat sheet) |
| `npm run typecheck` | `tsc -b`                         |
| `npm run lint`      | oxlint                           |
| `npm test`          | Vitest unit + flow tests         |
| `npm run build`     | Production build to `dist/`      |

## URL parameters

`?agent_id=claude&agent_name=Claude&redirect_uri=https://…` — all optional. `redirect_uri` must be
http(s); after authorising, the page auto-redirects there after 4 s. Parsing lives in
`src/lib/authorisationRequest.ts`.

## Mock behaviour (`src/services/mockData.ts`)

- OTP is always `123456`; 3 wrong attempts lock the code (request a new one).
- Resend is allowed after 30 s; codes expire after 5 min.
- Members: `9876543210` (cap ₹10,000, 90 days), `9123456789` (cap ₹2,000, 30 days).
- Any other valid number → "Not a Member Yet?" screen straight after "Send OTP" (no OTP is sent).
- `9000000000` → simulated network error.

## Structure

```
src/
  types/auth.ts                     domain types + ServiceError codes
  services/agentAuthService.ts      AgentAuthService interface (the integration contract)
  services/mockAgentAuthService.ts  mock implementation
  services/index.ts                 createAgentAuthService() — the single swap point
  features/authorise/
    useAuthorisationFlow.ts         reducer-based state machine; all service calls
    AuthorisePage.tsx               step routing
    steps/                          MobileStep, OtpStep, LimitsStep, SuccessStep, NotMemberScreen
  components/                       AuthCard layout, ui/ primitives (Button, OtpInput, Stepper…), icons
  lib/                              validation, formatting, date helpers
```

## Integrating the real MCP APIs

1. Implement `AgentAuthService` (e.g. `src/services/mcpAgentAuthService.ts`) against the real endpoints.
2. Map API failures to `ServiceError` codes (`INVALID_OTP`, `TOO_MANY_ATTEMPTS`, `SESSION_EXPIRED`, …) —
   the UI branches on these codes only.
3. Return it from `createAgentAuthService()` in `src/services/index.ts`.
4. Confirm the request/redirect parameters and adjust `readAuthorisationRequest`.

Open questions for the API spec: session/token model,
server-side limit bounds, how the result is returned to the agent (redirect params, code exchange,
callback), and real Terms/Privacy/app-store URLs (currently placeholders).
