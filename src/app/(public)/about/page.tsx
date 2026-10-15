"use client";

import { Leaf, Target, Heart, Users, Globe, Award } from "lucide-react";

const VALUES = [
  {
    icon: <Leaf className="h-7 w-7" />,
    title: "Sustainability",
    description: "We are committed to sustainable farming practices that protect the environment while supporting local communities.",
  },
  {
    icon: <Target className="h-7 w-7" />,
    title: "Quality First",
    description: "Every product undergoes rigorous quality control to meet international standards and customer expectations.",
  },
  {
    icon: <Heart className="h-7 w-7" />,
    title: "Integrity",
    description: "We conduct business with honesty, transparency, and respect for all our partners and stakeholders.",
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: "Partnership",
    description: "We build long-lasting relationships with farmers, customers, and partners based on mutual trust and benefit.",
  },
];

const MILESTONES = [
  { year: "2015", event: "Founded in Surabaya, East Java" },
  { year: "2017", event: "First international export to China" },
  { year: "2019", event: "Expanded to 10+ countries" },
  { year: "2021", event: "ISO 9001:2015 certification" },
  { year: "2023", event: "50,000 MT annual capacity" },
  { year: "2025", event: "Launched digital trading platform" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/logo-indocassava.jpeg"
              alt="INDOCASSAVA"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                About INDOCASSAVA
              </h1>
              <p className="text-primary text-sm uppercase tracking-wide mt-1">Export</p>
            </div>
          </div>
          <p className="text-lg text-gray-500 max-w-3xl leading-relaxed">
            Connecting Indonesian cassava farmers with global markets since 2015.
            We are committed to quality, sustainability, and building lasting partnerships.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">Our Story</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                From Surabaya to the World
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                INDOCASSAVA was founded with a simple mission: to connect the rich cassava
                resources of Indonesia with growing global demand. Starting as a small trading
                company in Surabaya, we have grown into one of the leading cassava exporters
                in Southeast Asia.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our success is built on strong relationships with local farmers, rigorous
                quality control, and a deep understanding of international trade requirements.
                We work directly with over 100 partner farmers across East Java, Central Java,
                and South Sumatra.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we serve clients in over 15 countries across Asia, Europe, and the Americas,
                providing premium cassava products that meet the highest international standards.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">10+</p>
                  <p className="text-sm text-gray-600 mt-1">Years Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">15+</p>
                  <p className="text-sm text-gray-600 mt-1">Countries</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100+</p>
                  <p className="text-sm text-gray-600 mt-1">Partner Farmers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">50K+</p>
                  <p className="text-sm text-gray-600 mt-1">MT Capacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 rounded-lg border border-gray-200">
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted and preferred cassava trading partner globally,
                known for quality, reliability, and sustainable practices that benefit
                all stakeholders.
              </p>
            </div>
            <div className="bg-white p-7 rounded-lg border border-gray-200">
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide premium cassava products through efficient supply chain management,
                strict quality control, and innovative solutions that create value for our
                partners and customers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">Core Values</p>
            <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <div key={index} className="p-5 rounded-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
                  {value.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">Milestones</p>
            <h2 className="text-2xl font-bold text-gray-900">Our Journey</h2>
          </div>
          <div className="space-y-6">
            {MILESTONES.map((milestone, index) => (
              <div key={index} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium text-xs">
                    {milestone.year.slice(-2)}
                  </div>
                  {index < MILESTONES.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-medium text-primary">{milestone.year}</p>
                  <p className="text-gray-900 font-medium text-sm">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
