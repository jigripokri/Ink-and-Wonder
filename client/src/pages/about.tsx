import { motion } from "framer-motion";
import Header from "@/components/Header";
import { siteName } from "@/lib/siteName";

export default function About() {
  const features = [
    {
      number: "01",
      title: "For the Grandchildren",
      description:
        "These stories are written for the little ones who will one day be big enough to read them. A gift from their Nani and Dadi, waiting for them whenever they're ready.",
    },
    {
      number: "02",
      title: "Small Moments, Big Meaning",
      description:
        "Morning chai, kitchen wisdom, garden lessons, family stories. The quiet things that seem ordinary today but become treasures with time.",
    },
    {
      number: "03",
      title: "Written from the Heart",
      description:
        "No fancy words needed. Just honest reflections from a grandmother who wants her family to know what she's learned, felt, and loved along the way.",
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="text-4xl text-muted-foreground/40 mb-6 font-serif">❦</div>
          <h1 className="text-5xl md:text-6xl mb-6">About {siteName}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A grandmother's journal, kept for the ones she loves most
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex-1 h-px bg-border max-w-32"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
            <div className="flex-1 h-px bg-border max-w-32"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center group"
            >
              <div className="text-6xl font-light text-muted-foreground/20 mb-4 transition-opacity group-hover:opacity-30">
                {feature.number}
              </div>
              <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-border rounded-lg p-12 md:p-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl text-center mb-8 font-medium">A Note to My Grandchildren</h2>

          <div className="space-y-8 text-lg leading-relaxed opacity-90">
            <p>
              <span className="float-left text-[4.5rem] leading-[0.85] mr-2 mt-1 font-medium">
                O
              </span>
              ne day, you'll be old enough to sit down and read these pages.
              By then, you might know me as Nani or Dadi, the one who always
              had a story, a cup of chai ready, and strong opinions about
              wearing sweaters in winter.
            </p>

            <p>
              I started writing here because I realized that so many things
              I've learned, the lessons from your great-grandparents, the
              little moments that shaped our family, they live only in my
              memory. And memories, as I'm learning, don't always stay put.
            </p>

            <p>
              So this is my way of keeping them safe for you. Stories about
              growing up, things I wish someone had told me sooner, recipes
              that don't have exact measurements, and thoughts about life
              that come to me in the quiet hours of the morning.
            </p>

            <p>
              None of this is meant to be perfect. It's just your grandmother,
              writing things down before she forgets, hoping that someday these
              words will make you smile, or help, or simply remind you that
              you were always, always loved.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="flex-1 h-px bg-border max-w-24"></div>
            <div className="text-2xl font-serif text-muted-foreground/60">❦</div>
            <div className="flex-1 h-px bg-border max-w-24"></div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
