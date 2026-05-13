"use client";

type CaptchaPlaceholderProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function CaptchaPlaceholder({ checked, disabled = false, onChange }: CaptchaPlaceholderProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]"
      />
      <span>
        <span className="block font-medium text-slate-900">CAPTCHA placeholder</span>
        <span className="block text-xs leading-6 text-slate-500">Light verification hook enabled now, ready for Turnstile or reCAPTCHA later.</span>
      </span>
    </label>
  );
}
