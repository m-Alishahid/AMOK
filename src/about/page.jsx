import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  const dummyData = {
    hero: {
      title: "About Our Company",
      subtitle: "Building amazing experiences since 2020",
      description: "We are passionate about creating innovative solutions that make a difference in people's lives."
    },
    stats: [
      { number: "1000+", label: "Happy Customers" },
      { number: "50+", label: "Projects Completed" },
      { number: "24/7", label: "Support Available" },
      { number: "5★", label: "Customer Rating" }
    ],
    team: [
      { id: 1, name: "John Doe", role: "CEO & Founder", bio: "Experienced leader in tech with 10+ years in the industry.", image: "👨‍💼" },
      { id: 2, name: "Jane Smith", role: "CTO", bio: "Expert in software development and cloud technologies.", image: "👩‍💻" },
      { id: 3, name: "Bob Johnson", role: "Lead Designer", bio: "Creative UI/UX designer passionate about user experience.", image: "👨‍🎨" }
    ],
    values: [
      { icon: "🎯", title: "Mission", description: "To deliver exceptional products that exceed customer expectations." },
      { icon: "👁️", title: "Vision", description: "To be the leading provider of innovative solutions worldwide." },
      { icon: "💡", title: "Innovation", description: "Constantly pushing boundaries to create cutting-edge solutions." }
    ]
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

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {dummyData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dummyData.values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
                  <div className="text-6xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dummyData.team.map(member => (
                <div key={member.id} className="bg-gray-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
                  <div className="text-8xl mb-4">{member.image}</div>
                  <h3 className="text-2xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
