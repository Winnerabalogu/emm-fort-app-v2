/* eslint-disable react/no-unescaped-entities */
"use client"
import { useState } from "react"
import { useInView } from "react-intersection-observer"

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

const ContactPageComponent = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim() || formData.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters'
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'contact_form'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitStatus('success')
        setSubmitMessage(data.message || 'Thank you for your message! We\'ll get back to you soon.')
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        setSubmitStatus('error')
        if (data.details) {
          // Handle validation errors from server
          setFormErrors(data.details)
          setSubmitMessage('Please fix the errors below and try again.')
        } else {
          setSubmitMessage(data.error || 'Failed to send message. Please try again.')
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>      
      <div>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-blue-400 via-white to-orange-200">
          <div className="container mx-auto pt-32 pb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We would love to hear from you.</p>
          </div>
        </section>

        {/* Main Contact Section */}
        <section ref={ref} className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Contact Info */}
              <div
                className={`
                  transition-all duration-1000 ease-out
                  ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
                `}
              >
                <div className="mb-8">
                  <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">GET IN TOUCH</h6>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Let's start talk</h2>
                  <p className="text-gray-600 text-lg">
                    Ready to take your content creation journey to the next level? Get in touch with our team and let's
                    explore how we can help you succeed.
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-8">
                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-orange-500 font-semibold text-sm uppercase tracking-wide">LOCATIONS</h4>
                      <p className="text-gray-900 font-semibold">Jalan Cempaka Wangi No 22</p>
                      <p className="text-gray-600">Jakarta - Indonesia</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-orange-500 font-semibold text-sm uppercase tracking-wide">EMAIL US</h4>
                      <p className="text-gray-900 font-semibold">support@emm-fort.com</p>
                      <p className="text-gray-600">creator@emm-fort.com</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-orange-500 font-semibold text-sm uppercase tracking-wide">PHONE</h4>
                      <p className="text-gray-900 font-semibold">+6221.2002.2012</p>
                      <p className="text-gray-600">+6221.2002.2013 (Fax)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Form */}
              <div
                className={`
                  transition-all duration-1000 ease-out
                  ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
                `}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                  <p className="text-gray-600 mb-8">
                    Fill out the form below and we&apos;ll get back to you as soon as possible. Let&apos;s discuss how we can help
                    you achieve your creator goals.
                  </p>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-700 font-medium">{submitMessage}</p>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-red-700 font-medium">{submitMessage}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Your Full Name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                            formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          required
                        />
                        {formErrors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          required
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+62 xxx xxx xxxx"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                            formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What's this about?"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                            formErrors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          required
                        />
                        {formErrors.subject && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Tell us more about your project or question..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none ${
                          formErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.message && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105 text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-96 relative">
          <div className="absolute inset-0 bg-gray-200">
            {/* Google Maps Embed for Jalan Cempaka Wangi No 22, Jakarta */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1944491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bce8!2sJl.%20Cempaka%20Wangi%20No.22%2C%20Menteng%2C%20Kec.%20Menteng%2C%20Kota%20Jakarta%20Pusat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sen!2sid!4v1635123456789"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>

          {/* Map Overlay */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
            <h4 className="font-bold text-gray-900 mb-2">Visit Our Office</h4>
            <p className="text-gray-600 text-sm mb-3">
              Jalan Cempaka Wangi No 22
              <br />
              Menteng, Jakarta Pusat
              <br />
              Indonesia
            </p>
            <button className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Get Directions
            </button>
          </div>
        </section>
      </div>      
    </>
  )
}

export default ContactPageComponent