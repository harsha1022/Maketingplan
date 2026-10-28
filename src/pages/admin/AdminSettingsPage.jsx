import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const isDemo = !isSupabaseConfigured;

const DEMO_SETTINGS = {
  campaign_name: 'Build Your First AI Project in 60 Minutes',
  target_registrations: 500,
  workshop_format: 'Online (link to be shared before session)',
  workshop_duration: '60 minutes',
  contact_email: 'campaign@example.com',
  status: 'active',
  campaign_start: '',
  campaign_end: '',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEMO_SETTINGS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    document.title = 'Settings — Admin';
    if (isDemo) { setLoading(false); return; }
    supabase.from('campaign_settings').select('*').single().then(({ data, error: err }) => {
      if (err) { setError(err.message); }
      else if (data) {
        setSettings({
          ...data,
          campaign_start: data.campaign_start ? data.campaign_start.slice(0,10) : '',
          campaign_end:   data.campaign_end   ? data.campaign_end.slice(0,10)   : '',
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (isDemo) {
      await new Promise(r => setTimeout(r, 800));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }

    const payload = {
      campaign_name:        settings.campaign_name,
      target_registrations: parseInt(settings.target_registrations),
      workshop_format:      settings.workshop_format,
      workshop_duration:    settings.workshop_duration,
      contact_email:        settings.contact_email,
      status:               settings.status,
      campaign_start:       settings.campaign_start || null,
      campaign_end:         settings.campaign_end   || null,
      updated_at:           new Date().toISOString(),
    };

    const { error: err } = await supabase.from('campaign_settings').update(payload).neq('id', null);
    setSaving(false);
    if (err) { setError(err.message); }
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Audit log
      await supabase.from('admin_audit_log').insert({
        action: 'update_campaign_settings',
        affected_table: 'campaign_settings',
        change_metadata: payload,
      });
    }
  }

  function field(key, label, type = 'text', hint = '') {
    return (
      <div className="form-group" style={{marginBottom:'var(--space-5)'}}>
        <label className="form-label" htmlFor={`setting-${key}`}>{label}</label>
        <input
          id={`setting-${key}`}
          type={type}
          className="form-input"
          value={settings[key] || ''}
          onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
          disabled={saving}
        />
        {hint && <span className="form-hint">{hint}</span>}
      </div>
    );
  }

  return (
    <AdminLayout title="Campaign Settings">
      {isDemo && (
        <div className="alert alert-info" style={{marginBottom:'var(--space-6)'}}>
          <Info size={16} style={{flexShrink:0}} />
          Demo Mode — settings changes are local only. Configure Supabase to persist them.
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{height:400,borderRadius:'var(--radius-lg)'}} />
      ) : (
        <div style={{maxWidth:640}}>
          <form onSubmit={handleSave}>
            {/* Workshop Info */}
            <div className="card" style={{marginBottom:'var(--space-6)'}}>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-semibold)',fontSize:'var(--text-lg)',marginBottom:'var(--space-5)',color:'var(--color-navy-900)'}}>
                Workshop Information
              </h2>
              {field('campaign_name', 'Campaign / Workshop Name', 'text', 'Displayed on the public landing page.')}
              {field('workshop_format', 'Workshop Format', 'text', 'e.g. "Online (link shared before session)"')}
              {field('workshop_duration', 'Duration', 'text', 'e.g. "60 minutes"')}
              {field('contact_email', 'Organizer Contact Email', 'email', 'Shown in the footer.')}
            </div>

            {/* Campaign Config */}
            <div className="card" style={{marginBottom:'var(--space-6)'}}>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-semibold)',fontSize:'var(--text-lg)',marginBottom:'var(--space-5)',color:'var(--color-navy-900)'}}>
                Campaign Configuration
              </h2>
              {field('target_registrations', 'Registration Target', 'number', 'Goal: 500 registrations in 7 days.')}
              {field('campaign_start', 'Campaign Start Date', 'date')}
              {field('campaign_end',   'Campaign End Date',   'date', 'After this date, the leaderboard can be frozen by changing status to Closed.')}

              <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
                <label className="form-label" htmlFor="setting-status">Campaign Status</label>
                <select
                  id="setting-status"
                  className="form-select"
                  value={settings.status}
                  onChange={e => setSettings(s => ({ ...s, status: e.target.value }))}
                  disabled={saving}
                >
                  <option value="draft">Draft — not yet live</option>
                  <option value="active">Active — accepting registrations</option>
                  <option value="paused">Paused — temporarily disabled</option>
                  <option value="closed">Closed — final standings locked</option>
                </select>
                <span className="form-hint">
                  Setting to <strong>Closed</strong> will prevent new registrations and freeze leaderboard rankings.
                </span>
              </div>
            </div>

            {/* Actions */}
            {error && (
              <div className="alert alert-error" style={{marginBottom:'var(--space-4)'}} role="alert">
                <AlertTriangle size={16} /> {error}
              </div>
            )}
            {saved && (
              <div className="alert alert-success" style={{marginBottom:'var(--space-4)'}} role="status">
                <CheckCircle size={16} /> Settings saved successfully.
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving} id="settings-save-btn">
              {saving
                ? <><span className="spinner" style={{borderTopColor:'white'}} /> Saving…</>
                : <><Save size={16} /> Save Settings</>}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
