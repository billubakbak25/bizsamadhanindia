-- Phase 2: Backend Enhancement Schema Extensions
-- Run this migration to add support for:
-- 1. Extended User Profiles
-- 2. Order Tracking & Stage Management
-- 3. Expert Profiles & Assignment
-- 4. Multi-channel Notifications

-- =====================================================
-- 1. EXTENDED USER PROFILES
-- =====================================================

-- User Profile extension table (additional profile data for clients)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Personal Information
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    
    -- Business Information
    company_name VARCHAR(255),
    company_type VARCHAR(50), -- pvt_ltd, llp, opc, proprietorship, partnership
    gst_number VARCHAR(20),
    cin_number VARCHAR(30),
    industry VARCHAR(100),
    annual_turnover VARCHAR(50),
    employee_count VARCHAR(50),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Preferences
    preferred_language VARCHAR(20) DEFAULT 'en',
    communication_preferences JSONB DEFAULT '{"email": true, "sms": true, "whatsapp": true, "push": true}'::jsonb,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- KYC Status
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, verified, rejected
    kyc_submitted_at TIMESTAMP,
    kyc_verified_at TIMESTAMP,
    kyc_documents JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_client_id ON user_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);

-- =====================================================
-- 2. EXPERT PROFILES & ASSIGNMENT SYSTEM
-- =====================================================

-- Expert profiles table
CREATE TABLE IF NOT EXISTS experts (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info
    expert_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Professional Info
    designation VARCHAR(100), -- Senior CA, Legal Advisor, Compliance Expert
    expert_type VARCHAR(50) NOT NULL, -- ca, cs, lawyer, consultant, support
    specializations JSONB DEFAULT '[]'::jsonb, -- ["gst", "income_tax", "company_registration"]
    qualifications JSONB DEFAULT '[]'::jsonb, -- [{"degree": "CA", "year": 2015, "institution": "ICAI"}]
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    
    -- Ratings & Performance
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_cases_handled INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_cases INTEGER DEFAULT 10,
    current_case_count INTEGER DEFAULT 0,
    
    -- Pricing
    hourly_rate INTEGER DEFAULT 0, -- in paise
    consultation_fee INTEGER DEFAULT 0, -- in paise
    
    -- Metadata
    languages JSONB DEFAULT '["en", "hi"]'::jsonb,
    working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experts_expert_type ON experts(expert_type);
CREATE INDEX IF NOT EXISTS idx_experts_is_active ON experts(is_active);
CREATE INDEX IF NOT EXISTS idx_experts_is_available ON experts(is_available);
CREATE INDEX IF NOT EXISTS idx_experts_rating ON experts(rating DESC);

-- Expert availability slots for booking
CREATE TABLE IF NOT EXISTS expert_availability_slots (
    id SERIAL PRIMARY KEY,
    expert_id INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type VARCHAR(20) DEFAULT 'consultation', -- consultation, follow_up, review
    
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by_client_id INTEGER REFERENCES clients(id),
    booking_reference VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(expert_id, slot_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_expert_slots_expert_date ON expert_availability_slots(expert_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_expert_slots_is_booked ON expert_availability_slots(is_booked);

-- Expert reviews
CREATE TABLE IF NOT EXISTS expert_reviews (
    id SERIAL PRIMARY KEY,
    expert_id INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id INTEGER, -- Optional reference to order
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(expert_id, client_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert ON expert_reviews(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_published ON expert_reviews(is_published);

-- =====================================================
-- 3. ORDER TRACKING & STAGE MANAGEMENT
-- =====================================================

-- Orders table (enhanced service tracking)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(30) UNIQUE NOT NULL, -- BIZ-2024-00001
    
    -- Client & Payment Info
    client_id INTEGER NOT NULL REFERENCES clients(id),
    payment_id INTEGER REFERENCES payments(id),
    
    -- Service Info
    service_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(50) DEFAULT 'standard', -- basic, standard, premium
    
    -- Pricing
    base_price INTEGER NOT NULL DEFAULT 0, -- in paise
    discount_amount INTEGER DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Assignment
    assigned_expert_id INTEGER REFERENCES experts(id),
    assigned_at TIMESTAMP,
    
    -- Status & Progress
    status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, in_progress, review, completed, cancelled, refunded
    current_stage VARCHAR(50),
    progress_percentage INTEGER DEFAULT 0,
    
    -- SLA Tracking
    expected_completion_date DATE,
    actual_completion_date DATE,
    sla_status VARCHAR(20) DEFAULT 'on_track', -- on_track, at_risk, breached
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    confirmed_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_service_code ON orders(service_code);
CREATE INDEX IF NOT EXISTS idx_orders_expert_id ON orders(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order stages/milestones
CREATE TABLE IF NOT EXISTS order_stages (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    stage_code VARCHAR(50) NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    stage_order INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, skipped
    
    -- Assignment (can override order-level assignment for specific stages)
    assigned_to_expert_id INTEGER REFERENCES experts(id),
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expected_completion_at TIMESTAMP,
    
    -- Checklist items for this stage
    checklist JSONB DEFAULT '[]'::jsonb, -- [{"item": "Verify documents", "completed": true}]
    
    -- Notes
    notes TEXT,
    client_visible_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_stages_order_id ON order_stages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_stages_status ON order_stages(status);

-- Order activity log
CREATE TABLE IF NOT EXISTS order_activities (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(50) NOT NULL, -- status_change, note_added, document_uploaded, expert_assigned, stage_completed
    activity_description TEXT NOT NULL,
    
    -- Who performed the action
    performed_by_type VARCHAR(20), -- system, expert, client, admin
    performed_by_id INTEGER,
    performed_by_name VARCHAR(255),
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Visibility
    is_client_visible BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_activities_order ON order_activities(order_id);
CREATE INDEX IF NOT EXISTS idx_order_activities_type ON order_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_order_activities_created ON order_activities(created_at DESC);

-- Order documents (specific to orders, not general client documents)
CREATE TABLE IF NOT EXISTS order_documents (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES order_stages(id),
    
    document_type VARCHAR(50) NOT NULL, -- input, output, certificate, report
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    mime_type VARCHAR(100),
    file_size INTEGER,
    
    -- Upload info
    uploaded_by_type VARCHAR(20), -- client, expert, admin, system
    uploaded_by_id INTEGER,
    
    -- Review status
    review_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, needs_revision
    reviewed_by_id INTEGER,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    -- Visibility
    is_client_visible BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_documents_order ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_order_documents_stage ON order_documents(stage_id);
CREATE INDEX IF NOT EXISTS idx_order_documents_type ON order_documents(document_type);

-- =====================================================
-- 4. MULTI-CHANNEL NOTIFICATIONS
-- =====================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    
    -- Event trigger
    event_type VARCHAR(50) NOT NULL, -- order_created, stage_completed, payment_received, etc.
    
    -- Channel configurations
    email_enabled BOOLEAN DEFAULT TRUE,
    email_subject VARCHAR(255),
    email_body TEXT,
    
    sms_enabled BOOLEAN DEFAULT TRUE,
    sms_body VARCHAR(500),
    
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_template_name VARCHAR(100),
    whatsapp_body TEXT,
    
    push_enabled BOOLEAN DEFAULT FALSE,
    push_title VARCHAR(100),
    push_body VARCHAR(255),
    
    -- Variables available: {{client_name}}, {{order_number}}, {{service_name}}, {{expert_name}}, etc.
    available_variables JSONB DEFAULT '[]'::jsonb,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_event ON notification_templates(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Notifications queue/log
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    
    -- Recipient
    client_id INTEGER REFERENCES clients(id),
    expert_id INTEGER REFERENCES experts(id),
    recipient_type VARCHAR(20) NOT NULL, -- client, expert, admin
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Template & Event
    template_id INTEGER REFERENCES notification_templates(id),
    event_type VARCHAR(50) NOT NULL,
    
    -- Channel
    channel VARCHAR(20) NOT NULL, -- email, sms, whatsapp, push
    
    -- Content
    title VARCHAR(255),
    body TEXT NOT NULL,
    
    -- Context
    order_id INTEGER REFERENCES orders(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, read
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    
    -- Provider response
    provider_message_id VARCHAR(255),
    provider_response JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_client ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- User notification preferences (more granular than profile-level)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Per-event preferences
    event_type VARCHAR(50) NOT NULL,
    
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_client ON notification_preferences(client_id);

-- =====================================================
-- 5. ANALYTICS ENHANCEMENT TABLES
-- =====================================================

-- Daily metrics aggregation for dashboards
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    
    -- Lead metrics
    leads_total INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    leads_by_source JSONB DEFAULT '{}'::jsonb,
    leads_by_service JSONB DEFAULT '{}'::jsonb,
    
    -- Order metrics
    orders_total INTEGER DEFAULT 0,
    orders_completed INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    orders_by_service JSONB DEFAULT '{}'::jsonb,
    
    -- Revenue metrics
    revenue_total INTEGER DEFAULT 0, -- in paise
    revenue_by_service JSONB DEFAULT '{}'::jsonb,
    avg_order_value INTEGER DEFAULT 0,
    
    -- Client metrics
    new_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    
    -- Expert metrics
    expert_utilization JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_metrics(metric_date DESC);

-- =====================================================
-- 6. SEED NOTIFICATION TEMPLATES
-- =====================================================

INSERT INTO notification_templates (template_code, template_name, event_type, email_subject, email_body, sms_body, whatsapp_body, available_variables) VALUES
('ORDER_CREATED', 'Order Created', 'order_created', 
 'Your Order #{{order_number}} has been placed - Wadhwani Associates',
 'Dear {{client_name}},\n\nThank you for choosing Wadhwani Associates. Your order #{{order_number}} for {{service_name}} has been successfully placed.\n\nOur team will review your requirements and assign an expert shortly.\n\nOfficial Support Representative: Vikram Wadhwani\nSupport: support@bizsamadhanindia.com | +91 9696893625 | +91 8303340092\n\nTrack your order: {{order_tracking_url}}\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: Order #{{order_number}} placed for {{service_name}}. Track: {{order_tracking_url}}',
 'Hi {{client_name}}! Your order #{{order_number}} for {{service_name}} has been placed successfully. Our expert will contact you soon. Track here: {{order_tracking_url}}',
 '["client_name", "order_number", "service_name", "order_tracking_url"]'::jsonb),

('EXPERT_ASSIGNED', 'Expert Assigned', 'expert_assigned',
 'Expert Assigned to Your Order #{{order_number}} - Wadhwani Associates',
 'Dear {{client_name}},\n\n{{expert_name}} has been assigned to handle your {{service_name}} request.\n\nExpert Details:\n- Name: {{expert_name}}\n- Designation: {{expert_designation}}\n- Experience: {{expert_experience}} years\n\nOfficial Support Representative: Vikram Wadhwani\nSupport: support@bizsamadhanindia.com | +91 9696893625 | +91 8303340092\n\nThey will reach out to you shortly.\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: {{expert_name}} assigned to your order #{{order_number}}. They will contact you soon.',
 'Great news! {{expert_name}} ({{expert_designation}}) has been assigned to your {{service_name}} request. They will contact you shortly.',
 '["client_name", "order_number", "service_name", "expert_name", "expert_designation", "expert_experience"]'::jsonb),

('STAGE_COMPLETED', 'Stage Completed', 'stage_completed',
 'Progress Update: {{stage_name}} Completed - Order #{{order_number}}',
 'Dear {{client_name}},\n\nGreat news! The "{{stage_name}}" stage of your {{service_name}} order has been completed.\n\nCurrent Progress: {{progress_percentage}}%\nNext Stage: {{next_stage_name}}\n\nTrack your order: {{order_tracking_url}}\n\nOfficial Support Representative: Vikram Wadhwani\nSupport: support@bizsamadhanindia.com | +91 9696893625 | +91 8303340092\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: Stage "{{stage_name}}" completed for order #{{order_number}}. Progress: {{progress_percentage}}%',
 'Update on your order #{{order_number}}: Stage "{{stage_name}}" is now complete! Progress: {{progress_percentage}}%. Next: {{next_stage_name}}',
 '["client_name", "order_number", "service_name", "stage_name", "next_stage_name", "progress_percentage", "order_tracking_url"]'::jsonb),

('ORDER_COMPLETED', 'Order Completed', 'order_completed',
 'Congratulations! Your {{service_name}} is Complete - Wadhwani Associates',
 'Dear {{client_name}},\n\nCongratulations! Your {{service_name}} has been successfully completed.\n\nOrder #: {{order_number}}\nCompleted on: {{completion_date}}\n\nYou can download your documents from your dashboard: {{dashboard_url}}\n\nFor support, contact Vikram Wadhwani at support@bizsamadhanindia.com, +91 9696893625, or +91 8303340092.\n\nWe hope you had a great experience. Please consider leaving a review.\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: Your {{service_name}} (Order #{{order_number}}) is complete. Download documents from your dashboard.',
 'Congratulations {{client_name}}! Your {{service_name}} is now complete. Download your documents here: {{dashboard_url}}. We would love to hear your feedback!',
 '["client_name", "order_number", "service_name", "completion_date", "dashboard_url"]'::jsonb),

('DOCUMENT_REQUIRED', 'Document Required', 'document_required',
 'Action Required: Document Needed for Order #{{order_number}}',
 'Dear {{client_name}},\n\nWe need the following document to proceed with your {{service_name}}:\n\nRequired Document: {{document_name}}\nReason: {{document_reason}}\n\nPlease upload the document from your dashboard: {{upload_url}}\n\nFor help, contact Vikram Wadhwani at support@bizsamadhanindia.com or +91 9696893625.\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: Please upload {{document_name}} for order #{{order_number}}. Upload here: {{upload_url}}',
 'Hi {{client_name}}, we need "{{document_name}}" to proceed with your order #{{order_number}}. Please upload here: {{upload_url}}',
 '["client_name", "order_number", "service_name", "document_name", "document_reason", "upload_url"]'::jsonb),

('PAYMENT_RECEIVED', 'Payment Received', 'payment_received',
 'Payment Received - Order #{{order_number}} Confirmed',
 'Dear {{client_name}},\n\nWe have received your payment of ₹{{amount}} for {{service_name}}.\n\nTransaction Details:\n- Order #: {{order_number}}\n- Amount: ₹{{amount}}\n- Payment ID: {{payment_id}}\n- Date: {{payment_date}}\n\nYour order is now confirmed and will be processed shortly.\n\nOfficial Support Representative: Vikram Wadhwani\nSupport: support@bizsamadhanindia.com | +91 9696893625 | +91 8303340092\n\nBest regards,\nWadhwani Associates',
 'Wadhwani Associates: Payment of ₹{{amount}} received for order #{{order_number}}. Your order is confirmed.',
 'Thank you {{client_name}}! Payment of ₹{{amount}} received for {{service_name}}. Order #{{order_number}} confirmed. We will begin processing shortly.',
 '["client_name", "order_number", "service_name", "amount", "payment_id", "payment_date"]'::jsonb)

ON CONFLICT (template_code) DO NOTHING;

-- =====================================================
-- 7. SEED INITIAL EXPERTS (Sample)
-- =====================================================

INSERT INTO experts (expert_code, name, email, phone, designation, expert_type, specializations, experience_years, rating, is_active) VALUES
('EXP001', 'Vikram Wadhwani', 'support@bizsamadhanindia.com', '9696893625', 'Official Support Representative', 'consultant', '["gst", "income_tax", "company_registration", "roc_filing", "trademark", "compliance"]'::jsonb, 10, 4.8, true),
('EXP002', 'Wadhwani Associates Support Desk', 'support@bizsamadhanindia.com', '8303340092', 'Client Support Desk', 'consultant', '["billing", "documents", "grievance", "follow_up", "service_delivery"]'::jsonb, 5, 4.7, true)
ON CONFLICT (expert_code) DO NOTHING;

-- =====================================================
-- DONE
-- =====================================================
