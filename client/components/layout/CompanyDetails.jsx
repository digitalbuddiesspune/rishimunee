import { company } from "../../lib/company.js";

export const CompanyDetails = ({ className = "" }) => (
  <div className={`space-y-1 text-sm text-[color:var(--color-text-soft)] ${className}`}>
    <p className="font-medium text-[color:var(--color-text)]">{company.legalName}</p>
    <p>Registration Number: {company.registrationNumber}</p>
    <p>CIN: {company.cin}</p>
    <p>Registered Office: {company.address}</p>
  </div>
);
