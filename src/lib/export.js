import Papa from 'papaparse';

/**
 * Convert an array of objects to a CSV download.
 */
export function downloadCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Flatten registration records for CSV export (admin only).
 * Omits sensitive fields not needed in export.
 */
export function flattenRegistrationForExport(reg) {
  return {
    ID: reg.id,
    'Full Name': reg.full_name,
    Email: reg.email,
    College: reg.college,
    'Study Year': reg.study_year,
    'Phone (optional)': reg.phone || '',
    'Referral Code': reg.attributed_referral_code || 'direct',
    'Attribution Source': reg.attribution_source,
    Status: reg.registration_status,
    'Is Demo': reg.is_demo ? 'YES (demo data)' : 'No',
    'Registered At': reg.registered_at,
  };
}

/**
 * Flatten promoter records for CSV export.
 */
export function flattenPromoterForExport(promoter, stats = {}) {
  return {
    ID: promoter.id,
    'Display Name': promoter.display_name,
    Category: promoter.category,
    'College / Club': promoter.college_or_club || '',
    'Referral Code': promoter.referral_code,
    Active: promoter.active ? 'Yes' : 'No',
    'Is Demo': promoter.is_demo ? 'YES (demo data)' : 'No',
    Clicks: stats.clicks || 0,
    Registrations: stats.registrations || 0,
    'Conversion Rate': stats.clicks
      ? ((stats.registrations / stats.clicks) * 100).toFixed(1) + '%'
      : '0%',
    'Created At': promoter.created_at,
  };
}
