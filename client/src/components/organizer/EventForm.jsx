import { useState, useEffect, useRef } from 'react';
import ImageUpload from '../ui/ImageUpload';

const CATEGORIES = [
  { value: '', label: 'Select a category' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'networking', label: 'Networking' },
  { value: 'webinar', label: 'Webinar' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  date: '',
  endDate: '',
  time: '',
  venue: '',
  address: '',
  city: '',
  country: '',
  capacity: '',
  price: 0,
  currency: 'USD',
  tags: [],
  image: '',
};

const getTodayString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const EventForm = ({ initialData = null, onSubmit, isEditing = false, isLoading = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const firstErrorRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        time: initialData.time || '',
        venue: initialData.location?.venue || initialData.venue || '',
        address: initialData.location?.address || initialData.address || '',
        city: initialData.location?.city || initialData.city || '',
        country: initialData.location?.country || initialData.country || '',
        capacity: initialData.capacity || '',
        price: initialData.price ?? 0,
        currency: initialData.currency || 'USD',
        tags: initialData.tags || [],
        image: initialData.image || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorRef.current = null;
    }
  }, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be at most 100 characters';
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = 'Description must be at most 5000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else if (!isEditing && new Date(formData.date) < new Date(new Date().toDateString())) {
      newErrors.date = 'Event date must be in the future';
    }

    if (formData.endDate && formData.date && new Date(formData.endDate) < new Date(formData.date)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.capacity || Number(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstField = Object.keys(newErrors)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) firstErrorRef.current = el;
    }

    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    category: formData.category,
    date: formData.date,
    endDate: formData.endDate || undefined,
    time: formData.time || undefined,
    location: {
      venue: formData.venue.trim(),
      address: formData.address.trim() || undefined,
      city: formData.city.trim(),
      country: formData.country.trim() || undefined,
    },
    capacity: Number(formData.capacity),
    price: Number(formData.price) || 0,
    currency: Number(formData.price) > 0 ? formData.currency : undefined,
    tags: formData.tags.length > 0 ? formData.tags : undefined,
    image: formData.image || undefined,
  });

  const handleSubmit = (e, publishAfterSave = false) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(buildPayload(), publishAfterSave);
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white dark:bg-gray-800
     text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
     focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
     ${errors[field]
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-300 dark:border-gray-600'
    }`;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  const errorClass = 'mt-1 text-xs text-red-500 dark:text-red-400';

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {/* Section 1 — Basic Information */}
      <FormSection title="Basic Information" icon={InfoIcon}>
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="title" className={labelClass}>Title <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-400 dark:text-gray-500">{formData.title.length}/100</span>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            maxLength={100}
            className={inputClass('title')}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="description" className={labelClass}>Description <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-400 dark:text-gray-500">{formData.description.length}/5000</span>
          </div>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event in detail..."
            rows={5}
            maxLength={5000}
            className={`${inputClass('description')} resize-y min-h-[120px]`}
          />
          {errors.description && <p className={errorClass}>{errors.description}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>Category <span className="text-red-500">*</span></label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputClass('category')}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category}</p>}
        </div>
      </FormSection>

      {/* Section 2 — Date & Time */}
      <FormSection title="Date & Time" icon={CalendarIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className={labelClass}>Event Date <span className="text-red-500">*</span></label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={isEditing ? undefined : getTodayString()}
              className={inputClass('date')}
            />
            {errors.date && <p className={errorClass}>{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className={labelClass}>End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.date || getTodayString()}
              className={inputClass('endDate')}
            />
            {errors.endDate && <p className={errorClass}>{errors.endDate}</p>}
          </div>
          <div>
            <label htmlFor="time" className={labelClass}>Time</label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className={inputClass('time')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 3 — Location */}
      <FormSection title="Location" icon={LocationIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue" className={labelClass}>Venue Name <span className="text-red-500">*</span></label>
            <input
              id="venue"
              name="venue"
              type="text"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Convention Center"
              className={inputClass('venue')}
            />
            {errors.venue && <p className={errorClass}>{errors.venue}</p>}
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className={inputClass('address')}
            />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>City <span className="text-red-500">*</span></label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Istanbul"
              className={inputClass('city')}
            />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="country" className={labelClass}>Country</label>
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. Turkey"
              className={inputClass('country')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 4 — Capacity & Pricing */}
      <FormSection title="Capacity & Pricing" icon={TicketIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="capacity" className={labelClass}>Capacity <span className="text-red-500">*</span></label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={handleNumberChange}
              placeholder="e.g. 100"
              className={inputClass('capacity')}
            />
            {errors.capacity && <p className={errorClass}>{errors.capacity}</p>}
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>Price</label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={handleNumberChange}
              placeholder="0 = Free"
              className={inputClass('price')}
            />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
            {Number(formData.price) === 0 && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">Free event</p>
            )}
          </div>
          {Number(formData.price) > 0 && (
            <div>
              <label htmlFor="currency" className={labelClass}>Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={inputClass('currency')}
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.value} value={cur.value}>{cur.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </FormSection>

      {/* Section 5 — Additional Details */}
      <FormSection title="Additional Details" icon={SparklesIcon}>
        {/* Tags */}
        <div>
          <label htmlFor="tagInput" className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                           bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                  aria-label={`Remove ${tag}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
            className={inputClass('tags')}
            disabled={formData.tags.length >= 10}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {formData.tags.length}/10 tags — Press Enter to add
          </p>
        </div>

        {/* Image */}
        <div>
          <label className={labelClass}>Event Image</label>
          <ImageUpload
            value={formData.image}
            onChange={(url) => {
              setFormData((prev) => ({ ...prev, image: url }));
            }}
          />
        </div>
      </FormSection>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {!isEditing && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold
                       text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm
                       hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Spinner />}
            Publish Event
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold
                     rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                     ${isEditing
              ? 'text-white bg-primary-600 hover:bg-primary-700'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
            }`}
        >
          {isLoading && <Spinner />}
          {isEditing ? 'Update Event' : 'Save as Draft'}
        </button>
      </div>
    </form>
  );
};

/* ═══════ Sub-components ═══════ */

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-2.5 mb-5">
      <Icon />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ═══════ Section Icons ═══════ */

const InfoIcon = () => (
  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const TicketIcon = () => (
  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default EventForm;
