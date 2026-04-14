
const Footer = () => {

  const currentYear = new Date().getFullYear()

  const footerData = {
    navigation: [
      {
        title: "Privacy Policy",
        url: "/privacy-policy",
      },
      {
        title: "Terms of Service",
        url: "/terms-of-service",
      },
      {
        title: "Support",
        url: "/support",
      },
      {
        title: "Pricing",
        url: "/pricing",
      },
      {
        title: "Explore",
        url: "/explore",
      },

    ],
  }

  return (
    <footer className=' mt-10 flex-col sm:flex-row flex items-center justify-between px-6 py-4 border-t '>
      <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
        &copy; {currentYear} Solodesk. All rights reserved.
      </div>

      <div className="container mx-auto py-2 flex flex-wrap justify-center gap-4">
        {footerData.navigation.map((item, index) => (
          <a
            key={index}
            href={item.url}
            className="text-muted-foreground  text-sm hover:text-primary/80 hover:underline  transition-all duration-200"
          >
            {item.title}
          </a>
        ))}
      </div>
    </footer>
  )
}

export default Footer
