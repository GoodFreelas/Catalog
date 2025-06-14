import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className="p-6"
      style={{ fontFamily: "Mona Sans, system-ui, sans-serif" }}
      animate={{
        backgroundColor: "rgba(255, 255, 255, 1)",
        backdropFilter: "blur(0px)",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <p
          style={{ color: "#0F0F0F" }}
          className="text-xs font-medium leading-relaxed"
        >
          2025 © Detcheler
          <br />
          Todos os direitos reservados
          <br />
          Desenvolvido por{" "}
          <a
            href="https://www.instagram.com/parcer.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-all duration-200"
            style={{ color: "#0F0F0F" }}
          >
            @parcer.studio
          </a>
        </p>
      </div>
    </motion.footer>
  );
}
