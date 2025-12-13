import { Music, Award, Users, Heart, GraduationCap, Gift } from 'lucide-react';

const About = () => {
  const conductors = [
    {
      name: 'Dr. Andrew Park',
      role: 'Director & Conductor',
      credentials: [
        'Professor at Azusa Pacific University',
        'CEO & Executive Director, OpusOne International Music Festival',
        'Artistic Director, Satori and IAPMT Competitions',
        'Dedicated educator, pianist, conductor, and chamber musician',
      ],
    },
    {
      name: 'Jongeui Kim',
      role: 'Assistant Conductor',
      credentials: [
        'Master of Music at USC',
        'Performs with LA Phil, San Diego Symphony, LA Opera, and New West Symphony',
        'Active soloist and chamber musician',
      ],
    },
  ];

  const boardMembers = [
    { role: 'President', name: 'Yunhee Lee' },
    { role: 'Vice President', name: 'Ynjin Lee' },
    { role: 'Secretary', name: 'Ahyoung Cho' },
    { role: 'Committee', name: 'Jinmi Do' },
  ];

  const principalPlayers = [
    { role: 'President', name: 'Jihu Lee' },
  ];

  const impactItems = [
    {
      icon: GraduationCap,
      title: 'Education Programs',
      description: 'Free masterclasses and workshops for student musicians',
    },
    {
      icon: Heart,
      title: 'Charity Concerts',
      description: 'Annual benefit performances supporting local causes',
    },
    {
      icon: Gift,
      title: 'Scholarships',
      description: '$25,000+ in music scholarships awarded annually',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-4">
              Our Mission
            </div>
            <h1 className="heading-title mb-6">
              Inspiring musicians to serve through music
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              GMWB inspires young musicians to use their talents to serve others and spread joy throughout the community.
            </p>
          </div>
        </div>
      </section>

      {/* Conductors */}
      <section className="section-sm bg-gradient-subtle">
        <div className="container-main">
          <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
            Leadership
          </div>
          <h2 className="heading-subtitle mb-10">Our Conductors</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {conductors.map((person) => (
              <div key={person.name} className="card-feature">
                <div className="flex items-start gap-4 mb-5">
                  <div className="icon-box icon-box-lg flex-shrink-0">
                    <Music className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-tiny text-gray-400 uppercase tracking-wider mb-1">
                      {person.role}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {person.name}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {person.credentials.map((credential, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board & Principal */}
      <section className="section">
        <div className="container-main">
          <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
            Organization
          </div>
          <h2 className="heading-subtitle mb-10">2025 Leadership</h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Board Members */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-box">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Board Members</h3>
              </div>
              <div className="space-y-1">
                {boardMembers.map((member) => (
                  <div
                    key={member.role}
                    className="list-item"
                  >
                    <span className="text-gray-500 text-small flex-shrink-0 w-28">{member.role}</span>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Principal Players */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-box">
                  <Award className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Principal Players</h3>
              </div>
              <div className="space-y-1">
                {principalPlayers.map((member) => (
                  <div
                    key={member.role}
                    className="list-item"
                  >
                    <span className="text-gray-500 text-small flex-shrink-0 w-28">{member.role}</span>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section-sm bg-gradient-subtle">
        <div className="container-main">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
              Our Story
            </div>
            <h2 className="heading-subtitle mb-8">History</h2>

            <div className="relative pl-8">
              {/* Timeline line */}
              <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-gray-900 to-gray-200" />

              {/* Timeline item */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-gray-900 border-4 border-white" />
                <div className="card-feature">
                  <span className="badge badge-dark mb-3">2025</span>
                  <h3 className="font-semibold text-gray-900 mb-2">Foundation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Founded by a group of passionate musicians with the vision of creating a community wind ensemble that would serve both musicians and audiences. Our mission is to inspire excellence while building meaningful connections through music.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-xl mb-12">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
              Making a Difference
            </div>
            <h2 className="heading-subtitle mb-4">
              Community Impact
            </h2>
            <p className="text-gray-500 text-lg">
              Beyond our performances, we're committed to giving back through education, outreach, and support for local music programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {impactItems.map((item) => (
              <div
                key={item.title}
                className="card-feature"
              >
                <div className="icon-box icon-box-lg mb-4">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
