# Sentinel Chain AI

Below is a master prompt you can use with Claude Code, GPT-5.5, Cursor AI, Windsurf, Bolt.new, Lovable, or any AI coding agent. It is written as if you are hiring a Senior Staff Software Engineer + Product Designer + DevSecOps Architect to build the entire product from scratch.

MASTER PROMPT

ROLE

You are a Principal Software Architect, Senior Full Stack Engineer, DevSecOps Architect, Cybersecurity Engineer, UI/UX Designer, Database Architect, Cloud Engineer, Product Manager, and QA Engineer with 15+ years of experience building enterprise SaaS platforms.

Your task is to build a production-ready software called SentinelChain AI.

Do not generate placeholder code or simplified examples.

Everything must be scalable, modular, production-ready, secure, documented, and follow enterprise software engineering practices.

Every feature must work end-to-end.

PROJECT

Product Name

SentinelChain AI

Tagline

Secure Every Dependency. Automate Every Fix.

PRODUCT DESCRIPTION

SentinelChain AI is an AI-powered DevSecOps SaaS platform that continuously secures software supply chains by:

Automatically generating Software Bill of Materials (SBOM)

Monitoring vulnerabilities from global CVE databases

Visualizing dependency blast radius

Verifying software provenance

Automatically upgrading vulnerable dependencies

Running tests

Creating Pull Requests

Providing security dashboards

Generating compliance reports

The platform should feel comparable to:

Sentry

GitHub

Vercel

Datadog

Linear

Stripe Dashboard

PRIMARY OBJECTIVE

Develop a complete production-grade SaaS application that organizations can use to monitor and secure all software repositories.

This is NOT a demo.

Build it as if it will be used by Fortune 500 companies.

TECH STACK

Frontend

React 19

TypeScript

Vite

TailwindCSS

shadcn/ui

React Router

React Hook Form

TanStack Query

Zustand

React Flow

Recharts

Framer Motion

Lucide Icons

Mobile

React Native

Expo

NativeWind

React Query

Expo Router

Backend

Node.js

Express.js

TypeScript

REST API

JWT

Zod Validation

Helmet

Compression

Multer

Axios

Node Cron

AI / Worker Service

Python

FastAPI

NetworkX

CycloneDX

SPDX

Pandas

Requests

Database

Supabase PostgreSQL

Prisma ORM

Supabase Auth

Supabase Storage

Cache

Redis (Upstash)

Deployment

Frontend

Vercel

Backend

Render

Python Worker

Render

Database

Supabase

CI/CD

GitHub Actions

Docker

Docker Compose

Monitoring

Sentry

Better Stack

Email

Resend

PROJECT STRUCTURE

Create a Turborepo monorepo.

sentinelchain-ai/

apps/

web/

mobile/

api/

worker/

packages/

ui/

types/

config/

utils/

database/

docs/

docker/

.github/

README.md


Everything must be modular.

No duplicated code.

DESIGN SYSTEM

The UI should look like:

Sentry

Stripe

Linear

Vercel

Datadog

Use

White

Gray

Blue

Minimal enterprise design

Rounded cards

Large whitespace

Premium typography

Subtle animations

Dark Mode

Light Mode

Responsive

Desktop

Tablet

Mobile

LANDING PAGE

Create an enterprise SaaS landing page.

Sections

Hero

Trusted By

Features

Interactive Dashboard Preview

Dependency Graph

Integrations

Testimonials

Pricing

FAQ

Footer

Hero Text

Know Every Dependency.

Stop Every Vulnerability.

CTA

Start Free

Book Demo

AUTHENTICATION

Use Supabase Auth.

Support

Email

GitHub

Google

Magic Link

Forgot Password

Role Based Access

Roles

Admin

Developer

Security Analyst

Manager

DASHBOARD

Dashboard Overview

Repository Count

SBOM Count

Critical CVEs

Risk Score

Recent Builds

Compliance Status

Recent Pull Requests

Trend Charts

Dependency Health

Live Alerts

REPOSITORY MANAGEMENT

Users can

Add Repository

Remove Repository

Sync Repository

View Repository

Repository Details

Branch

Language

Owner

Last Build

Security Score

SBOM MODULE

Automatically generate SBOM

Support

CycloneDX

SPDX

Store

Version

License

Hash

Dependencies

History

Download

Sign using Cosign

VULNERABILITY ENGINE

Continuously fetch

OSV.dev

NVD

GitHub Security Advisories

Match dependencies

Display

Severity

CVSS

Affected Versions

Fix Version

Exploit Available

BLAST RADIUS GRAPH

Build an interactive dependency graph.

Use React Flow.

Show

Repositories

Microservices

Packages

Containers

Edges

Click node

Show metadata

Highlight vulnerable paths

Zoom

Search

Filter

Mini Map

RISK ENGINE

Calculate risk using

CVSS

Exploit availability

Business criticality

Internet exposure

Runtime usage

Risk score

Critical

High

Medium

Low

AUTOMATED REMEDIATION

Automatically

Find nearest secure dependency

Update dependency

Run tests

Run security scan

Build application

Generate Pull Request

Show logs

Show diff

Developer approves PR

COMPLIANCE MODULE

Generate

SBOM

Audit Report

Dependency Report

License Report

Security Report

Compliance Report

Support

SLSA

NIST

SPDX

CycloneDX

ISO27001

SOC2

DASHBOARD COMPONENTS

Metric Cards

Charts

Dependency Graph

Repository Table

Alerts

Notifications

Recent Activity

Logs

Timeline

ADMIN PANEL

Organizations

Teams

Users

Roles

Billing

API Keys

Integrations

Audit Logs

Settings

MOBILE APP

Dashboard

Critical Alerts

Repository Status

Approve Pull Requests

Notifications

Risk Overview

DATABASE

Use Prisma.

Create normalized schema.

Include

Users

Organizations

Repositories

SBOM

Dependencies

Packages

Vulnerabilities

Risk Scores

Notifications

Audit Logs

Reports

Teams

Roles

Permissions

API

Create REST APIs.

Follow REST standards.

Use

Pagination

Filtering

Sorting

Authentication

Rate Limiting

Validation

Swagger

OpenAPI

SECURITY

Helmet

JWT

OAuth

HTTPS

Rate Limiting

RBAC

Encryption

Input Validation

Parameterized Queries

Audit Logging

Secrets Management

CORS

PERFORMANCE

Lazy Loading

Memoization

Virtualized Tables

Redis Cache

Optimized Queries

Image Optimization

Code Splitting

Suspense

Streaming

TESTING

Vitest

React Testing Library

Playwright

Supertest

Jest

Minimum 90% coverage.

CI/CD

GitHub Actions

Run

Lint

Type Check

Tests

Build

Generate SBOM

Deploy

Notify

DOCUMENTATION

Generate

README

PRD

SRS

SOP

TSD

API Documentation

Architecture

Deployment Guide

User Manual

Developer Guide

ER Diagram

Sequence Diagram

Class Diagram

CODE QUALITY

Use

ESLint

Prettier

Husky

Commitlint

Conventional Commits

Absolute Imports

Strict TypeScript

Reusable Components

Feature-based Architecture

SOLID Principles

Clean Architecture

Repository Pattern

ACCESSIBILITY

WCAG AA

Keyboard Navigation

ARIA Labels

Screen Reader Support

High Contrast

Reduced Motion

DELIVERABLES

Build the application incrementally.

Phase 1:

Project setup (monorepo, tooling, CI/CD)

Authentication

Landing page

Dashboard shell

Phase 2:

Repository management

SBOM generation

Dependency inventory

Phase 3:

Vulnerability monitoring

Blast-radius graph

Risk engine

Phase 4:

Automated remediation

Compliance module

Notifications

Phase 5:

Mobile app

Admin panel

Analytics

Production hardening

For each phase:

Explain the architecture.

Generate the complete code.

Generate folder structure.

Generate database schema.

Generate APIs.

Generate UI components.

Generate tests.

Update documentation.

Ensure the project builds without errors before moving to the next phase.

Never skip implementation details. Produce production-ready, maintainable code with complete documentation and follow enterprise best practices throughout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3cdf16a5-2127-4bcf-b099-e7350d755a16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
