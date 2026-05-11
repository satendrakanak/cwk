# Marketplace Packaging Plan

This document defines how CodeWithKasa can be packaged for marketplace sales,
self-hosted customers, and SaaS customers without undervaluing the full platform.

## Product Positioning

Position the product as a white-label LMS for academies, coaching businesses,
and training institutes.

Do not position it as a small course website template. The platform includes
course management, payments, learner dashboards, faculty workflows, exams,
certificates, live classes, notifications, recordings, attendance, and
automation.

## Edition Strategy

### Starter Marketplace Edition

Use this for CodeCanyon or similar marketplaces where buyers expect an
affordable deployable product.

Include:

- Public website
- Admin dashboard
- Course catalog
- Course details
- Self-learning course flow
- Basic chapter and lecture management
- Cart and checkout
- Payment gateway setup
- Orders
- Learner dashboard
- Basic certificates
- Email templates
- Site settings
- Media manager
- Basic notifications
- Docker install guide
- Demo data

Exclude:

- BigBlueButton live classroom
- Faculty dashboard
- Batch management
- Attendance rules
- Recording management
- Advanced notification rules
- Dynamic scheduler
- Advanced exams question bank
- PWA push notification automation
- Multi-instructor operations

Recommended price:

- Regular license: $79 to $149
- Extended license: $399 to $699

### Plus Self-Hosted Edition

Use this for direct sales from your own website.

Include everything in Starter plus:

- Faculty dashboard
- Faculty-led courses
- Hybrid courses
- Batch management
- Class calendar
- Live class reminders
- Advanced exams
- Question bank
- Manual grading
- Certificate operations dashboard
- In-app notifications
- Broadcast notifications
- Engagement dashboard

Recommended price:

- One-time license: $399 to $799
- Installation service: $99 to $199
- Annual support renewal: $149 to $299

### Enterprise Self-Hosted Edition

Use this for institutes that need complete control and white-label deployment.

Include everything in Plus, plus:

- BigBlueButton integration
- Live classroom embed
- Recording sync
- Recording access control
- Attendance analytics
- Dynamic scheduler
- Advanced notification rules
- PWA install and push setup
- Priority support
- White-label branding
- Deployment assistance

Recommended price:

- One-time license: $999 to $2499
- Custom deployment and branding: quoted separately
- Annual maintenance: 20% to 30% of license value

### SaaS Edition

Use this as the long-term recurring business model.

Suggested pricing:

- Starter: ₹2,999/month for small academies
- Plus: ₹7,999/month for growing institutes
- Enterprise: custom pricing

SaaS should include hosting, backups, updates, security fixes, and managed
notifications. Self-hosted editions should remain available for customers who
need their own server.

## License Protection

For marketplace and self-hosted sales, add a license layer before public sale.

Recommended controls:

- License key activation
- One production domain per regular license
- Optional staging domain
- License status in admin settings
- Update downloads through licensed account
- Soft enforcement instead of breaking core admin access
- License checks for premium modules

Do not hard-code buyer data in source code. Do not make the app unusable if the
license server is temporarily unreachable. Instead, show warnings and grace
periods.

## Installation Flow

Use `/install` as the first-run setup experience for a new database. The wizard
should run before the buyer reaches the public site when no admin user exists.

Installer steps:

1. System check verifies the configured database connection.
2. Academy details collect the initial site name, tagline, and support contact.
3. License activation validates the buyer key against the CodeWithKasa License Portal.
4. Admin account creates the first administrator.
5. Optional demo import loads marketplace-ready JSON demo content.

For local development, run the CodeWithKasa License Portal on port `5000`, issue a
`codewithkasa` key, and point the app to it with
`LICENSE_PORTAL_URL=http://localhost:5000`. Docker installs automatically route
that localhost URL to the host machine internally.

For production, point `LICENSE_PORTAL_URL` to the hosted licence portal. The real
license key is entered only in the browser during installation; the installed
app stores activation metadata and a non-secret fingerprint.

## Demo Data Policy

Marketplace demos should look real but must not include real customer data.

Demo data should include:

- Multiple course types
- Published and unpublished courses
- Self-learning, faculty-led, and hybrid examples
- Categories and tags
- Free preview chapters
- Exams and certificates
- Faculty assignment examples
- English-only professional text
- Local demo images from `client/public/assets`

Never seed real payment keys, SMTP credentials, AWS credentials, BBB secrets, or
production user credentials.

## Recommended Sales Flow

1. Publish Starter Marketplace Edition for discovery.
2. Use the marketplace item page to upsell Plus and Enterprise plans.
3. Sell full self-hosted and SaaS plans from your own website.
4. Keep premium modules out of the low-cost marketplace ZIP.
5. Maintain one demo server with buyer-facing polished sample data.
