#! /usr/bin/bash
# This script assumes a fresh db with ID starting from 1

# Create users
pnpm cli:user-management create-user a@a.com password123
pnpm cli:user-management create-user b@b.com password123
pnpm cli:user-management create-user c@c.com password123
pnpm cli:user-management create-user d@d.com password123
pnpm cli:user-management create-user e@e.com password123
pnpm cli:user-management create-user f@f.com password123

# Assign dietician to first 2 users, and patient role to the rest
pnpm cli:user-management assign-role 1 dietician
pnpm cli:user-management assign-role 2 dietician
pnpm cli:user-management assign-role 3 patient
pnpm cli:user-management assign-role 4 patient
pnpm cli:user-management assign-role 5 patient
pnpm cli:user-management assign-role 6 patient

# Assign patients to dietician
pnpm cli:user-management assign-patient 1 3
pnpm cli:user-management assign-patient 1 4
pnpm cli:user-management assign-patient 2 5
pnpm cli:user-management assign-patient 2 6

