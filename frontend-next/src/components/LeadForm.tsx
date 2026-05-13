import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";

type LeadFormProps = {
  serviceName: string;
  serviceCode: string;
  cityName: string;
  servicePrice?: number | null;
  id?: string;
  placement?: string;
  title?: string;
  description?: string;
};

export function LeadForm({
  serviceName,
  serviceCode,
  cityName,
  servicePrice = null,
  id = "lead-form",
  placement = "seo_lead_form",
  title,
  description,
}: LeadFormProps) {
  return (
    <div id={id} className="scroll-mt-28">
      <LeadCaptureForm
        defaultService={serviceCode || serviceName}
        defaultCity={cityName}
        title={title || `Start ${serviceName} in ${cityName}`}
        description={description || "Fast 3-field form. Submit the lead or buy now, and your request goes into CRM, follow-up, and service workflow handling."}
        allowPayment
        servicePrice={servicePrice}
        lockService
        leadEndpoint="/api/crm/leads"
        trackingContext="seo_service_page"
        minimal
        placement={placement}
      />
    </div>
  );
}