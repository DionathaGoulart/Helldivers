export default function Footer() {
  return (
    <footer 
      className="border-t-2 border-[var(--border-primary)] w-full mt-auto"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="container page-content">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>© 2025 SUPER EARTH. Todos os direitos reservados. ™</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Servindo a Democracia™ desde 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
