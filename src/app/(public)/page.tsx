"use client";

import Link from "next/link";
import { ArrowRight, Package, Globe, Shield, Truck, CheckCircle, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

const ADVANTAGES = [
  {
    icon: <Leaf className="h-7 w-7" />,
    title: "Sustainable Sourcing",
    description: "Directly sourced from certified local farmers with sustainable practices",
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: "Quality Guaranteed",
    description: "Every batch undergoes rigorous quality control and inspection",
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: "Global Export",
    description: "Serving clients across Asia, Europe, and the Americas",
  },
  {
    icon: <Truck className="h-7 w-7" />,
    title: "Reliable Logistics",
    description: "End-to-end supply chain management with real-time tracking",
  },
  {
    icon: <Package className="h-7 w-7" />,
    title: "Flexible Orders",
    description: "From small samples to bulk container shipments, we accommodate all",
  },
  {
    icon: <CheckCircle className="h-7 w-7" />,
    title: "Compliance",
    description: "Full compliance with international trade regulations and certifications",
  },
];

export default function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ["public-products-home"],
    queryFn: async () => {
      const response = await api.get("/products/public", { page: 1, limit: 4 });
      return response;
    },
  });

  const products = (productsData?.data as any[]) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-2xl">
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-4">
                Indocassava Export
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
                From Root to Global Market
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                Your trusted partner for premium cassava products. We connect Indonesian cassava
                farmers with global markets through quality, reliability, and sustainability.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3 rounded-md font-medium hover:bg-primary-dark transition-colors"
                >
                  View Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-7 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <img
                src="/logo-indocassava.jpeg"
                alt="INDOCASSAVA Logo"
                className="w-64 h-64 rounded-full object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">10+</p>
              <p className="text-gray-400 text-sm mt-1">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold">15+</p>
              <p className="text-gray-400 text-sm mt-1">Countries Served</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-gray-400 text-sm mt-1">MT Annual Capacity</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100+</p>
              <p className="text-gray-400 text-sm mt-1">Partner Farmers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">What We Offer</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Our Products
            </h2>
            <p className="text-gray-500 max-w-2xl text-base">
              Premium cassava products sourced from the best farms in Indonesia,
              processed with international quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? products.map((product: any) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap font-medium shrink-0">
                      {product.category?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {product.description || "Premium quality cassava product"}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(product.sellingPrice || 0)}
                    <span className="text-xs text-gray-400 font-normal ml-1">/ {product.unit || "MT"}</span>
                  </p>
                </div>
              </Link>
            )) : (
              [
                { name: "Fresh Cassava", desc: "Premium quality fresh cassava roots", cat: "FRESH", emoji: "🌱" },
                { name: "Cassava Flour", desc: "High-grade cassava flour for food industry", cat: "FLOUR", emoji: "🌾" },
                { name: "Cassava Chips", desc: "Dried cassava chips ready for export", cat: "CHIPS", emoji: "🍟" },
                { name: "Tapioca Starch", desc: "Pure tapioca starch for industrial use", cat: "TAPIOCA", emoji: "⚗️" },
              ].map((p) => (
                <Link key={p.cat} href="/shop" className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">{p.emoji}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">Why Us</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Why Choose INDOCASSAVA
            </h2>
            <p className="text-gray-500 max-w-2xl text-base">
              We combine decades of industry experience with modern technology
              to deliver the best cassava products globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map((advantage, index) => (
              <div key={index} className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
                  {advantage.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Start Trading?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join hundreds of satisfied customers worldwide. Contact our sales team
            for custom orders, pricing, and partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-600 text-white px-7 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
