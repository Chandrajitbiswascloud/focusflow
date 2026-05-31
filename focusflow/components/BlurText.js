const BlurText = ({ text, className }) => {
  const containerRef = React.useRef(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Only trigger once
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const words = text.split(" ");
  const motion = window.Motion.motion;

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em"
      }}
    >
      {words.map((word, i) => {
        const delay = (i * 100) / 1000;
        return (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
            animate={
              isInView
                ? {
                    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : {}
            }
            transition={
              isInView
                ? {
                    duration: 0.7,
                    times: [0, 0.5, 1],
                    ease: "easeOut",
                    delay: delay,
                  }
                : {}
            }
            style={{
              display: "inline-block",
              marginRight: "0.28em",
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </p>
  );
};

window.BlurText = BlurText;
