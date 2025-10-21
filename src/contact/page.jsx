import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const dummyData = {
    hero: {
      title: "Get In Touch",
      subtitle: "We'd love to hear from you",
      description: "Have a question or want to work together? Send us a message and we'll respond as soon as possible."
    },
    contactInfo: [
      { icon: "📧", title: "Email", value: "contact@mywebsite.com", description: "Send us an email anytime!" },
      { icon: "📞", title: "Phone", value: "+1 (123) 456-7890", description: "Mon-Fri from 8am to 5pm." },
      { icon: "📍", title: "Office", value: "123 Main St, City, State", description: "Come say hello at our office." }
    ],
    socialLinks: [
      { id: 1, platform: "Facebook", url: "#", icon: "📘", color: "hover:text-blue-600" },
      { id: 2, platform: "Twitter", url: "#", icon: "🐦", color: "hover:text-blue-400" },
      { id: 3, platform: "LinkedIn", url: "#", icon: "💼", color: "hover:text-blue-700" },
      { id: 4, platform: "Instagram", url: "#", icon: "📷", color: "hover:text-pink-600" }
    ],
    form: {
      fields: [
        { name: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
        { name: "subject", label: "Subject", type: "text", placeholder: "What's this about?" },
        { name: "message", label: "Message", type: "textarea", placeholder: "Tell us more..." }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{dummyData.hero.title}</h1>
            <p className="text-xl mb-4">{dummyData.hero.subtitle}</p>
            <p className="text-lg max-w-2xl mx-auto">{dummyData.hero.description}</p>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dummyData.contactInfo.map((info, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
                  <div className="text-6xl mb-4">{info.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                  <p className="text-blue-600 font-medium mb-2">{info.value}</p>
                  <p className="text-gray-600">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Send us a Message</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dummyData.form.fields.slice(0, 3).map((field, index) => (
                    <div key={index} className={field.name === 'subject' ? 'md:col-span-2' : ''}>
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Tell us more..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 text-center">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Follow Us</h2>
            <p className="text-gray-600 mb-8">Stay connected and get the latest updates</p>
            <div className="flex justify-center space-x-6">
              {dummyData.socialLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className={`text-4xl transition duration-300 ${link.color}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
