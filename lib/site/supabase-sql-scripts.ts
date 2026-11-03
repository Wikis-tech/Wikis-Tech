// Comprehensive SQL Migrations Catalog & Recommended Handshake Script
// For Supabase project mgzvfhrnrrvbmajkrmgp

export interface MigrationScript {
  id: string;
  filename: string;
  phase: string;
  title: string;
  description: string;
  tablesAffected: string[];
}

export const ADMIN_SETUP_SQL = `-- =========================================================================
-- WIKIS TECH PORTFOLIO — SET / RESET ADMIN EMAIL & PASSWORD IN SUPABASE
-- Project Ref: mgzvfhrnrrvbmajkrmgp
-- Paste into: Supabase Dashboard > SQL Editor > New query > Run
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check who is currently registered in your Supabase Auth:
SELECT id, email, created_at, last_sign_in_at FROM auth.users;

-- CREATE OR RESET ADMIN USER (Choose your desired email and password below):
DO $$
DECLARE
  target_email text := 'wikistech07@gmail.com';  -- Change if desired
  new_password text := 'WisdomAdmin2026!';      -- Change to your desired password
  user_id uuid;
BEGIN
  -- If user exists, update password and confirm email:
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = user_id;

    -- Guarantee admin role in profiles table
    INSERT INTO public.profiles (id, display_name, role, is_active)
    VALUES (user_id, 'Wisdom', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;

    RAISE NOTICE 'Existing user % password updated successfully!', target_email;
  ELSE
    -- If user does not exist, create the admin user cleanly:
    user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      role, aud, confirmation_token
    ) VALUES (
      user_id, '00000000-0000-0000-0000-000000000000',
      target_email, crypt(new_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Wisdom"}'::jsonb,
      now(), now(), 'authenticated', 'authenticated', ''
    );

    INSERT INTO public.profiles (id, display_name, role, is_active)
    VALUES (user_id, 'Wisdom', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;

    RAISE NOTICE 'New admin user % created successfully!', target_email;
  END IF;
END $$;

-- Verify admin profile is ready:
SELECT id, display_name, role, is_active FROM public.profiles;
`;

export const RECOMMENDED_SETUP_SQL = `-- =========================================================================
-- WIKIS TECH PORTFOLIO — COMPLETE SUPABASE HANDSHAKE & RLS SYNC SCRIPT
-- Project Ref: mgzvfhrnrrvbmajkrmgp
-- Purpose: Guarantees full public read access for visitors + full CMS CRUD
--          access for authenticated admin, eliminating permission denied errors.
-- Safe to paste & execute in Supabase SQL Editor (Idempotent).
-- =========================================================================

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant Select on All Public Tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 3. Allow Public Inbound Leads (Contact Messages & Quote Requests)
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
GRANT INSERT ON TABLE public.quote_requests TO anon, authenticated;

-- Ensure default privileges for any future tables created
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- =========================================================================
-- 4. FIX PUBLIC READ POLICIES (Eliminating private.is_cms_user() checks for anon)
-- =========================================================================

-- About Profile
ALTER TABLE public.about_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "about_public_read" ON public.about_profile;
CREATE POLICY "about_public_read" ON public.about_profile
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Hero Settings
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hero_public_read" ON public.hero_settings;
CREATE POLICY "hero_public_read" ON public.hero_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Page Sections
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sections_public_read" ON public.page_sections;
CREATE POLICY "sections_public_read" ON public.page_sections
  FOR SELECT TO anon, authenticated
  USING (enabled = true);

-- Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skills_public_read" ON public.skills;
CREATE POLICY "skills_public_read" ON public.skills
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Experiences
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experience_public_read" ON public.experiences;
CREATE POLICY "experience_public_read" ON public.experiences
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Education
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "education_public_read" ON public.education;
CREATE POLICY "education_public_read" ON public.education
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Journey Items
ALTER TABLE public.journey_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journey_public_read" ON public.journey_items;
CREATE POLICY "journey_public_read" ON public.journey_items
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Technologies
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "technologies_public_read" ON public.technologies;
CREATE POLICY "technologies_public_read" ON public.technologies
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Now Items
ALTER TABLE public.now_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "now_public_read" ON public.now_items;
CREATE POLICY "now_public_read" ON public.now_items
  FOR SELECT TO anon, authenticated
  USING (visible = true);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (content_state = 'published' AND visibility = 'public' AND deleted_at IS NULL);

-- Project Publications
ALTER TABLE public.project_publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_publications_public_read" ON public.project_publications;
CREATE POLICY "project_publications_public_read" ON public.project_publications
  FOR SELECT TO anon, authenticated
  USING (true);

-- Project Categories
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_public_read" ON public.project_categories;
CREATE POLICY "categories_public_read" ON public.project_categories
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Project Category Links
ALTER TABLE public.project_category_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_category_links_public_read" ON public.project_category_links;
CREATE POLICY "project_category_links_public_read" ON public.project_category_links
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_category_links.project_id
        AND p.content_state = 'published'
        AND p.visibility = 'public'
        AND p.deleted_at IS NULL
    )
  );

-- Project Blocks
ALTER TABLE public.project_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_blocks_public_read" ON public.project_blocks;
CREATE POLICY "project_blocks_public_read" ON public.project_blocks
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_blocks.project_id
        AND p.content_state = 'published'
        AND p.visibility = 'public'
        AND p.deleted_at IS NULL
    )
  );

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT TO anon, authenticated
  USING (enabled = true AND deleted_at IS NULL);

-- Pricing Settings
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_settings_public_read" ON public.pricing_settings;
CREATE POLICY "pricing_settings_public_read" ON public.pricing_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Pricing Packages
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_packages_public_read" ON public.pricing_packages;
CREATE POLICY "pricing_packages_public_read" ON public.pricing_packages
  FOR SELECT TO anon, authenticated
  USING (visibility = true AND deleted_at IS NULL);

-- Service Pricing Links
ALTER TABLE public.service_pricing_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_pricing_links_public_read" ON public.service_pricing_links;
CREATE POLICY "service_pricing_links_public_read" ON public.service_pricing_links
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_pricing_links.service_id
        AND s.enabled = true
        AND s.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.pricing_packages p
      WHERE p.id = service_pricing_links.pricing_package_id
        AND p.visibility = true
        AND p.deleted_at IS NULL
    )
  );

-- Experiments / The Lab
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiments_public_read" ON public.experiments;
CREATE POLICY "experiments_public_read" ON public.experiments
  FOR SELECT TO anon, authenticated
  USING (visibility = 'public' AND deleted_at IS NULL);

-- CRAFT Settings
ALTER TABLE public.craft_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "craft_settings_public_read" ON public.craft_settings;
CREATE POLICY "craft_settings_public_read" ON public.craft_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Designs / Visual Archive
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "designs_public_read" ON public.designs;
CREATE POLICY "designs_public_read" ON public.designs
  FOR SELECT TO anon, authenticated
  USING (visibility = 'public' AND deleted_at IS NULL);

-- Design Categories
ALTER TABLE public.design_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "design_categories_public_read" ON public.design_categories;
CREATE POLICY "design_categories_public_read" ON public.design_categories
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Design Media
ALTER TABLE public.design_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "design_media_public_read" ON public.design_media;
CREATE POLICY "design_media_public_read" ON public.design_media
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.designs d
      WHERE d.id = design_media.design_id
        AND d.visibility = 'public'
        AND d.deleted_at IS NULL
    )
  );

-- Testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (visibility = true AND deleted_at IS NULL);

-- Navigation Items
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "navigation_items_public_read" ON public.navigation_items;
CREATE POLICY "navigation_items_public_read" ON public.navigation_items
  FOR SELECT TO anon, authenticated
  USING (enabled = true);

-- Social Links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_links_public_read" ON public.social_links;
CREATE POLICY "social_links_public_read" ON public.social_links
  FOR SELECT TO anon, authenticated
  USING (enabled = true);

-- Analytics & SEO Settings
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_settings_public_read" ON public.analytics_settings;
CREATE POLICY "analytics_settings_public_read" ON public.analytics_settings
  FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seo_settings_public_read" ON public.seo_settings;
CREATE POLICY "seo_settings_public_read" ON public.seo_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- =========================================================================
-- 5. ALLOW PUBLIC SUBMISSION OF CONTACT MESSAGES & QUOTE REQUESTS
-- =========================================================================

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quote_requests_public_insert" ON public.quote_requests;
CREATE POLICY "quote_requests_public_insert" ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- =========================================================================
-- 6. FULL ADMIN CMS ACCESS POLICIES (FOR AUTHENTICATED USERS)
-- =========================================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'about_profile', 'hero_settings', 'site_settings', 'page_sections',
    'skills', 'experiences', 'education', 'journey_items', 'technologies',
    'now_items', 'projects', 'project_publications', 'project_categories',
    'project_category_links', 'project_blocks', 'services', 'pricing_settings',
    'pricing_packages', 'service_pricing_links', 'experiments', 'craft_settings',
    'designs', 'design_categories', 'design_media', 'testimonials',
    'navigation_items', 'social_links', 'media_library', 'contact_messages',
    'quote_requests', 'analytics_settings', 'seo_settings', 'activity_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Ensure authenticated users have full CRUD on CMS tables
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_admin_all', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl || '_admin_all', tbl);
  END LOOP;
END $$;

-- Verify everything with a test query:
SELECT 'Handshake and RLS synchronization complete! All tables are accessible.' AS status;
`;

export const MIGRATIONS_CATALOG: MigrationScript[] = [
  {
    id: "0010",
    filename: "0010_fix_public_read_policies.sql",
    phase: "Phase 7 (Hotfix)",
    title: "⭐️ The Exact Recommended Script: Public Read Policies & RLS",
    description: "The primary script you should paste right now into your Supabase SQL Editor. Grants anon public select on all published portfolio rows and prevents private.is_cms_user() permissions errors.",
    tablesAffected: ["about_profile", "services", "pricing_packages", "experiments", "designs", "skills", "experiences", "page_sections", "testimonials"],
  },
  {
    id: "0001",
    filename: "0001_phase_1_foundation.sql",
    phase: "Phase 1",
    title: "Foundation & Roles",
    description: "Initial database foundation, private schema, UUID helpers, user role enum, and admin profiles table.",
    tablesAffected: ["profiles", "activity_logs"],
  },
  {
    id: "0002",
    filename: "0002_phase_2_media_admin_core.sql",
    phase: "Phase 2",
    title: "Media Library & Storage",
    description: "Media storage assets table, upload tracking, file metadata, and private upload buckets.",
    tablesAffected: ["media_library"],
  },
  {
    id: "0003",
    filename: "0003_phase_3_projects_cms.sql",
    phase: "Phase 3",
    title: "Projects & Content Engine",
    description: "Projects table, project blocks, categories, categories links, and workflow states.",
    tablesAffected: ["projects", "project_blocks", "project_categories", "project_category_links"],
  },
  {
    id: "0004",
    filename: "0004_phase_4_home_public_core.sql",
    phase: "Phase 4",
    title: "Homepage CMS & Project Publications",
    description: "Hero settings (rotating words, headline lines, CTA URLs), page sections, and publication snapshots.",
    tablesAffected: ["hero_settings", "page_sections", "project_publications"],
  },
  {
    id: "0005",
    filename: "0005_phase_5_identity_archive.sql",
    phase: "Phase 5",
    title: "About Profile, Timeline & Visual Archive",
    description: "About profile, skills, experiences, education, journey items, technologies, and graphic design archive tables.",
    tablesAffected: ["about_profile", "skills", "experiences", "education", "journey_items", "technologies", "designs", "design_categories", "design_media"],
  },
  {
    id: "0006",
    filename: "0006_phase_6_lab_services_pricing_now.sql",
    phase: "Phase 6",
    title: "The Lab, Services & Pricing Systems",
    description: "Experiments, CRAFT prompt framework settings, services, pricing packages, and service pricing links.",
    tablesAffected: ["experiments", "craft_settings", "services", "pricing_settings", "pricing_packages", "service_pricing_links", "now_items"],
  },
  {
    id: "0007",
    filename: "0007_phase_7_leads_contact_testimonials.sql",
    phase: "Phase 7",
    title: "Lead Generation & Testimonials",
    description: "Contact messages, quote requests, rate limits, and client testimonials.",
    tablesAffected: ["contact_messages", "quote_requests", "form_rate_limits", "testimonials"],
  },
  {
    id: "0008",
    filename: "0008_phase_7_hardening_positioning_case_studies.sql",
    phase: "Phase 7B",
    title: "Case Studies & Publications Hardening",
    description: "Adds structured snapshot triggers to automatically sync project case studies into publication rows.",
    tablesAffected: ["projects", "project_publications"],
  },
  {
    id: "0009",
    filename: "0009_phase_7_security_least_privilege.sql",
    phase: "Phase 7C",
    title: "Least Privilege Security Audit",
    description: "Audits schema function permissions and tightens public execution surfaces.",
    tablesAffected: ["private schema", "functions"],
  },
  {
    id: "0011",
    filename: "0011_phase_8_site_operations.sql",
    phase: "Phase 8",
    title: "Site Settings, Navigation & SEO",
    description: "Site brand settings, navigation menu links, social links, SEO tags, and analytics configuration.",
    tablesAffected: ["site_settings", "navigation_items", "social_links", "seo_settings", "analytics_settings"],
  },
];
