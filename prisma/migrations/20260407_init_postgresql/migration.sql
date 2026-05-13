-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "service" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "lead_temperature" TEXT NOT NULL DEFAULT 'cold',
    "source" TEXT,
    "timestamp" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_requests" (
    "id" SERIAL NOT NULL,
    "request_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "consultation_type" TEXT NOT NULL,
    "service" TEXT,
    "preferred_date" TEXT,
    "preferred_slot" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'call',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolved_at" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_applications" (
    "id" SERIAL NOT NULL,
    "application_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company_name" TEXT,
    "focus_area" TEXT,
    "experience_level" TEXT,
    "notes" TEXT,
    "referral_code" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "service" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_message" TEXT,
    "invoice_number" TEXT,
    "invoice_html" TEXT,
    "invoice_url" TEXT,
    "invoice_path" TEXT,
    "whatsapp_status" TEXT DEFAULT 'pending',
    "whatsapp_error" TEXT,
    "razorpay_signature" TEXT,
    "client_id" INTEGER,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "referral_code" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "order_id" TEXT,
    "payment_id" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "folder_name" TEXT NOT NULL DEFAULT 'general',
    "document_type" TEXT,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT,
    "file_path" TEXT NOT NULL,
    "file_url" TEXT,
    "mime_type" TEXT,
    "size" INTEGER,
    "uploaded_by_user_id" INTEGER,
    "uploaded_by_role" TEXT,
    "uploaded_at" TEXT NOT NULL,
    "review_status" TEXT NOT NULL DEFAULT 'pending_review',
    "reviewed_at" TEXT,
    "reviewed_by_user_id" INTEGER,
    "reviewed_by_role" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_mappings" (
    "id" SERIAL NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_name" TEXT NOT NULL,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "task_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "service_code" TEXT,
    "service_name" TEXT,
    "assigned_staff_id" TEXT,
    "assigned_staff_name" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "sla_due_at" TEXT,
    "completed_at" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" SERIAL NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "steps_json" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" SERIAL NOT NULL,
    "service_request_id" TEXT NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_step_code" TEXT,
    "context_json" TEXT,
    "steps_json" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_catalog" (
    "id" SERIAL NOT NULL,
    "service_code" TEXT NOT NULL,
    "addon_code" TEXT NOT NULL,
    "addon_name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" INTEGER NOT NULL,
    "pricing_type" TEXT NOT NULL DEFAULT 'fixed',
    "pricing_metadata" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "addon_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_suggestions" (
    "id" SERIAL NOT NULL,
    "payment_id" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "service_code" TEXT NOT NULL,
    "addon_code" TEXT NOT NULL,
    "addon_name" TEXT NOT NULL,
    "suggested_price" INTEGER NOT NULL,
    "pricing_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "accepted_at" TEXT,
    "rejected_at" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "addon_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "referral_code" TEXT NOT NULL,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "referrer_user_id" INTEGER NOT NULL,
    "referred_user_id" INTEGER NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reward_amount" INTEGER NOT NULL DEFAULT 0,
    "reward_status" TEXT NOT NULL DEFAULT 'pending',
    "rewarded_at" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_plans" (
    "id" SERIAL NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "interval_unit" TEXT NOT NULL,
    "interval_count" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reminder_days_before" INTEGER NOT NULL DEFAULT 3,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "billing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "plan_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "current_period_start" TEXT NOT NULL,
    "current_period_end" TEXT NOT NULL,
    "last_renewed_at" TEXT,
    "next_renewal_at" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_renewals" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "renewal_due_at" TEXT NOT NULL,
    "renewed_at" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "billing_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_reminders" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "renewal_id" INTEGER NOT NULL,
    "remind_at" TEXT NOT NULL,
    "sent_at" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "billing_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "step_key" TEXT NOT NULL,
    "scheduled_for" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "message" TEXT,
    "sent_at" TEXT,
    "cancelled_reason" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_service_idx" ON "leads"("service");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_requests_request_code_key" ON "consultation_requests"("request_code");

-- CreateIndex
CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests"("status");

-- CreateIndex
CREATE INDEX "consultation_requests_phone_idx" ON "consultation_requests"("phone");

-- CreateIndex
CREATE INDEX "support_tickets_client_id_idx" ON "support_tickets"("client_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "partner_applications_application_code_key" ON "partner_applications"("application_code");

-- CreateIndex
CREATE INDEX "partner_applications_status_idx" ON "partner_applications"("status");

-- CreateIndex
CREATE INDEX "partner_applications_email_idx" ON "partner_applications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_key" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "services_client_id_idx" ON "services"("client_id");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "documents_client_id_idx" ON "documents"("client_id");

-- CreateIndex
CREATE INDEX "documents_folder_name_idx" ON "documents"("folder_name");

-- CreateIndex
CREATE INDEX "documents_review_status_idx" ON "documents"("review_status");

-- CreateIndex
CREATE INDEX "otps_phone_idx" ON "otps"("phone");

-- CreateIndex
CREATE INDEX "logs_event_idx" ON "logs"("event");

-- CreateIndex
CREATE INDEX "logs_entity_type_entity_id_idx" ON "logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_mappings_service_code_key" ON "task_mappings"("service_code");

-- CreateIndex
CREATE INDEX "task_mappings_is_active_idx" ON "task_mappings"("is_active");

-- CreateIndex
CREATE INDEX "tasks_client_id_idx" ON "tasks"("client_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_service_code_idx" ON "tasks"("service_code");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_service_code_key" ON "workflow_definitions"("service_code");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_instances_service_request_id_key" ON "workflow_instances"("service_request_id");

-- CreateIndex
CREATE INDEX "workflow_instances_service_code_idx" ON "workflow_instances"("service_code");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "addon_catalog_addon_code_key" ON "addon_catalog"("addon_code");

-- CreateIndex
CREATE INDEX "addon_catalog_service_code_idx" ON "addon_catalog"("service_code");

-- CreateIndex
CREATE INDEX "addon_catalog_is_active_idx" ON "addon_catalog"("is_active");

-- CreateIndex
CREATE INDEX "addon_suggestions_payment_id_idx" ON "addon_suggestions"("payment_id");

-- CreateIndex
CREATE INDEX "addon_suggestions_client_id_idx" ON "addon_suggestions"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_referral_code_key" ON "referral_codes"("referral_code");

-- CreateIndex
CREATE INDEX "referral_codes_is_active_idx" ON "referral_codes"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_user_id_key" ON "referral_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referred_user_id_key" ON "referrals"("referred_user_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_user_id_idx" ON "referrals"("referrer_user_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "billing_plans_plan_code_key" ON "billing_plans"("plan_code");

-- CreateIndex
CREATE INDEX "billing_plans_is_active_idx" ON "billing_plans"("is_active");

-- CreateIndex
CREATE INDEX "subscriptions_client_id_idx" ON "subscriptions"("client_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "billing_renewals_subscription_id_idx" ON "billing_renewals"("subscription_id");

-- CreateIndex
CREATE INDEX "billing_renewals_status_idx" ON "billing_renewals"("status");

-- CreateIndex
CREATE INDEX "billing_reminders_subscription_id_idx" ON "billing_reminders"("subscription_id");

-- CreateIndex
CREATE INDEX "billing_reminders_renewal_id_idx" ON "billing_reminders"("renewal_id");

-- CreateIndex
CREATE INDEX "billing_reminders_status_idx" ON "billing_reminders"("status");

-- CreateIndex
CREATE INDEX "follow_ups_lead_id_idx" ON "follow_ups"("lead_id");

-- CreateIndex
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");

-- CreateIndex
CREATE INDEX "follow_ups_scheduled_for_idx" ON "follow_ups"("scheduled_for");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_suggestions" ADD CONSTRAINT "addon_suggestions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_code_fkey" FOREIGN KEY ("plan_code") REFERENCES "billing_plans"("plan_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_renewals" ADD CONSTRAINT "billing_renewals_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_reminders" ADD CONSTRAINT "billing_reminders_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_reminders" ADD CONSTRAINT "billing_reminders_renewal_id_fkey" FOREIGN KEY ("renewal_id") REFERENCES "billing_renewals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

