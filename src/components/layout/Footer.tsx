// Logo será carregada diretamente

const Footer = () => {
  return (
    <footer className="gradient-footer p-4 flex items-center justify-between text-white">
      <div className="flex items-center space-x-4">
        <img 
          src="/lovable-uploads/ff2a33ae-310a-4872-9dd8-a9f86a180d29.png" 
          alt="Paratech Logo" 
          className="h-12 w-auto"
        />
        <a 
          href="https://paratechsolucoes.com.br/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-orbitron font-bold text-lg hover:text-primary-glow transition-smooth"
        >
          PARATECH SOLUÇÕES E SISTEMAS
        </a>
      </div>
      
      <a 
        href="https://wa.me/5537920007857" 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-rajdhani font-semibold text-lg hover:text-primary-glow transition-smooth"
      >
        📞 (37) 9 2000-7857
      </a>
    </footer>
  );
};

export default Footer;