import Link from "next/link"

export function CategoriesSection() {
  const categories = [
    {
      name: "Suits",
      description: "Classic and modern suits for every occasion.",
      href: "/products?category=suits",
      icon: "business_center"
    },
    {
      name: "Separates", 
      description: "Mix and match pieces for a personalized look.",
      href: "/products?category=separates",
      icon: "inventory_2"
    },
    {
      name: "Accessories",
      description: "Complete your outfit with our stylish accessories.",
      href: "/products?category=accessories", 
      icon: "diamond"
    }
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Explore Our Categories
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
            Find the perfect pieces to complete your professional wardrobe.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {categories.map((category) => (
            <div key={category.name} className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#cf1773]/10 text-[#cf1773]">
                <span className="material-symbols-outlined text-3xl">{category.icon}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Link href={category.href} className="focus:outline-none">
                    <span aria-hidden="true" className="absolute inset-0"></span>
                    {category.name}
                  </Link>
                </h3>
                <p className="mt-1 text-base text-gray-500">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
