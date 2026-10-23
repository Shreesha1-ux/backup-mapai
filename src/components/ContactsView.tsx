import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  Trash2,
  Edit2,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react';
import { EmergencyContact } from '../types';

interface ContactsViewProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
  onUpdateContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  onSendTestAlert: (contact: EmergencyContact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onSendTestAlert,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRelationship, setFormRelationship] = useState('Family');

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: formName,
      phone: formPhone,
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      relationship: formRelationship,
      isPrimary: contacts.length === 0,
    };

    onAddContact(newContact);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setIsAdding(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Trusted Emergency Network</h2>
          </div>
          <p className="text-xs text-indigo-200 mt-1 max-w-md">
            When you activate SOS, silent alerts containing your live satellite tracking link are instantly dispatched to these contacts.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Add Contact Modal / Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSaveNew}
          className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Add New Emergency Contact</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Mobile Number</label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
              <select
                value={formRelationship}
                onChange={(e) => setFormRelationship(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Sibling">Sibling</option>
                <option value="Close Friend">Close Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                {contact.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                  {contact.isPrimary && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Primary Contact
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium">
                    · {contact.relationship}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {contact.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {contact.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => onSendTestAlert(contact)}
                title="Send simulated test SOS alert"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
              >
                <Send className="w-3 h-3" />
                Test Alert
              </button>
              <button
                onClick={() => onDeleteContact(contact.id)}
                title="Remove contact"
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
