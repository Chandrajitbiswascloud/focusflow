const CapabilitiesSection = () => {
  const FadingVideo = window.FadingVideo;
  const CapCard = window.CapCard;
  const motion = window.Motion.motion;

  const cardData = [
    {
      title: "AI Scenery",
      body: "AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.",
      iconPath: "M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z",
      tags: ["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"]
    },
    {
      title: "Batch Production",
      body: "Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.",
      iconPath: "M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z",
      tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"]
    },
    {
      title: "Smart Lighting",
      body: "Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.",
      iconPath: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z",
      tags: ["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 30 },
    show: { 
      filter: "blur(0px)", 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="capabilities" className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col justify-between z-10">
      {/* Background Video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
      />

      {/* Content wrapper */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-32 pb-16 flex flex-col min-h-screen justify-between max-w-7xl mx-auto w-full">
        {/* Header container */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 25 }}
          whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-auto"
        >
          {/* Kicker */}
          <div className="text-sm font-body text-white/80 mb-4 select-none tracking-wider">
            // Capabilities
          </div>
          
          {/* Heading */}
          <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] select-none">
            Production
            <br />
            evolved
          </h2>
        </motion.div>

        {/* Three Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 md:mt-16 w-full"
        >
          {cardData.map((card, index) => (
            <CapCard
              key={index}
              title={card.title}
              body={card.body}
              iconPath={card.iconPath}
              tags={card.tags}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

window.CapabilitiesSection = CapabilitiesSection;
