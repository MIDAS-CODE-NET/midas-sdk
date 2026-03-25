# Changelog

All notable changes to the Midas Code platform are documented here.

## [0.2.0] - 2026-03-25

### Added
- SEO metadata with OpenGraph and Twitter cards across all pages
- Auto-generated sitemap.xml and robots.txt for search engine indexing
- Vercel Analytics and Speed Insights for performance monitoring
- Custom 404 error page with branded design
- Contact form with email delivery via Resend
- Session history persistence -- users can resume past coding sessions
- Rate limit error UX with countdown timers and friendly messages
- USDC payment on-chain verification with transaction confirmation polling
- Blog section with 6 articles on engineering, product, and tutorials
- Syntax-highlighted code blocks with Atom One Dark theme

### Fixed
- USDC payment verification now waits for transaction confirmation
- Credit balance syncs across dashboard pages in real-time
- Email verification uses HTTP API instead of SMTP (port 465 blocked on VPS)
- Auth rate limits split between send-code and verify-code endpoints
- Code block text visibility on dark backgrounds

### Changed
- Rate limits relaxed: 20 prompts/min for agent, 15 verify attempts/10min
- Credit balance fetched from API on page load instead of stale localStorage

## [0.1.0] - 2026-03-22

### Added
- Initial platform launch at midascode.net
- AI code generation engine with 200K context window
- Email-based authentication (Gmail/Yahoo)
- Credit system with 3 pricing tiers
- USDC payments on Base chain
- API key management
- Usage analytics dashboard
- 19 product screenshots
- Status page with 8 service monitors
- Platform pages with LangChain-inspired design
