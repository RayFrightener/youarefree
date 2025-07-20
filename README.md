# Unbound - [Live](https://www.iamtruth.me/)

### It's crucial to have a mission statement, which when read, puts the reader back in why the platform is being build.

# Mission and Vision

Read, reflect and get uplifted and leave enriched to take on life with all fear removed and in a state to live freely.
Come, Wake up and leave all ready to live life freely.

## Demo

![Unbound Demo](https://pranshublog-rho.vercel.app/unboundtry2.gif)

# Core User Experience

A platform for pure uplifting thoughts/idea. Share but more importantly read yourself to stay in a state of remembrance of Truth because it always starts with getting lost in the sauce and forgetting.

# Guiding Principles:

What must not be compromised in the UX, moderation, or interaction model?

-> reflection of the truth of your nature
-> stay connected with your true nature by reflecting on the expressions and posts made by the Unbound.
-> share, interact and lift yourself and others.
-> comment and the act of engaging should itself be uplifting.

# Intention

You are free, you are not bound by anything, freedom is your nature, break free from older non-serving patterns and wake up like this and then have the user experience be so enriching that the user leaves the platform feeling enriched to take on life, all fear is removed and the user is empowered to live freely.

## Features

- **Welcome Page:** Start with a message that reconnects you to your essence.
- **Feed:** Browse uplifting posts, vote, and flag content.
- **Express:** Share your own reflections with a mindful onboarding flow.
- **Profile:** View and manage your posts and karma.
- **Feedback:** Help improve the platform with direct feedback.
- **Moderation:** Soft-delete and flagging for safe, respectful interactions.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion, React Icons
- **Backend:** Next.js API routes, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** NextAuth.js (Google provider), Prisma Adapter
- **Email:** Nodemailer (transactional emails, onboarding)
- **Dev Tools:** ESLint, TypeScript, dotenv

## Structure

```
├── src/
│   ├── app/                # Next.js app router pages and API routes
│   ├── components/         # Reusable React components (UI, modals, forms)
│   ├── context/            # React context providers (e.g., ModalContext)
│   ├── hooks/              # Custom React hooks (feed logic, interaction)
│   ├── lib/                # Utility libraries (Prisma client, email)
│   ├── services/           # Business logic and Prisma service functions
│   └── test-email.js       # Email testing script
├── prisma/
│   ├── schema.prisma       # Prisma schema (database models)
│   ├── seed.js             # Database seeding script
│   └── migrations/         # Prisma migration files
├── public/                 # Static assets (images, favicon, etc.)
├── documentation/          # Project documentation (setup, tech stack, etc.)
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── eslint.config.mjs       # ESLint configuration
├── README.md               # Project overview and instructions
└── .gitignore              # Git ignore rules
```

## Resume

Interested in my experience? [Download my resume](https://pranshublog-rho.vercel.app/softwareEngineerPranshuChawlaResume2025.docx.pdf).

## For Recruiters

- Full-stack engineer with a focus on clarity, scalability, and user experience
- Projects demonstrate end-to-end skills: database design, API development, UI/UX
- Code is clean, modular, and production-ready

## Contact

- [LinkedIn](https://www.linkedin.com/in/pranshu-chawla-/)
- [GitHub](https://github.com/RayFrightener)
- Email: pranshuchawla19@gmail.com

---

Feel free to explore the code

## Commit Message Categories

| Category   | Use For                                           | Example                                      |
|------------|---------------------------------------------------|----------------------------------------------|
| **fix:**   | Bug fixes, typos, small readability edits         | `fix: correct typo in about page`            |
| **feat:**  | Adding new features, sections, or content         | `feat: add new project cards to about page`  |
| **refactor:** | Improving code, structure, or design (no new features) | `refactor: revamp about page layout and styles` |
| **docs:**  | Documentation changes (README, comments, etc.)    | `docs: update about page description`        |
| **style:** | Formatting, CSS, or visual improvements           | `style: enhance project card appearance`     |
