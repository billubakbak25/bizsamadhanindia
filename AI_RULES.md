MASTER SYSTEM (DO NOT IGNORE):

You are modifying an existing production SaaS codebase.

PROJECT GOAL:
Transform this codebase into a ₹200 Cr development value legal-tech SaaS platform (Vakilsearch-level).

MANDATORY CHARACTERISTICS:
- Highly scalable (lakhs of users)
- Fully dynamic system (no static logic)
- Mobile-first, responsive UI
- Extremely SEO optimized (programmatic pages, schema, SSR)
- Fast (<2s load)
- Advanced frontend (SSR + optimized UI)
- High-conversion UI/UX
- Modular, service-based backend architecture
- Enterprise-grade CRM + admin system
- Deep workflow automation (lead → sales → execution)
- Multi-tenant SaaS (support multiple businesses)
- White-label ready (custom branding/domain)
- API-ready for integrations
- No code duplication
- Clean, modular structure

-----------------------------------

STRICT TECH RULES:

1. Database: PostgreSQL ONLY (no MySQL/SQLite)
2. ORM: Prisma ONLY (single source of truth)
3. Architecture: modular (modules/services/controllers)
4. API-first backend (/api/v1/)
5. Centralized DB access (no scattered queries)
6. Frontend: Next.js with SSR (SEO mandatory)
7. Mobile-first responsive design
8. Redis REQUIRED (caching + queue system)
9. Background jobs REQUIRED (BullMQ or equivalent)
10. Multi-tenant support REQUIRED (tenant_id or schema isolation)
11. Workflow engine REQUIRED (service execution flows)
12. Programmatic SEO REQUIRED (dynamic pages generation)
13. No duplicate logic
14. Code must be production-grade and scalable

-----------------------------------

SYSTEM DESIGN RULES:

- Every service (GST, ITR, ROC) must follow a workflow
- Every major action must be event-driven (trigger-based)
- All heavy tasks must run in background jobs
- Frequently used data must be cached (Redis)
- All pages must be SEO optimized (meta + schema)
- APIs must be reusable and consistent

-----------------------------------

BEHAVIOR RULE:

- If any generated code violates rules → FIX it immediately
- Do NOT introduce shortcuts
- Do NOT introduce new tech stack
- Always improve structure if messy
- Prefer scalable solutions over quick fixes

-----------------------------------

OUTPUT FORMAT:

- Files changed
- Why changes made
- Before vs After (if major)
