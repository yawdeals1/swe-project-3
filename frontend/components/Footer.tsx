export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-high">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-margin-mobile py-8 text-body-sm md:flex-row md:px-margin-desktop">
        <div className="text-headline-md font-bold text-primary">Carvo</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-on-secondary-container hover:underline" href="#">
            About Us
          </a>
          <a className="text-on-secondary-container hover:underline" href="#">
            Terms of Service
          </a>
          <a className="text-on-secondary-container hover:underline" href="#">
            Privacy Policy
          </a>
          <a className="text-on-secondary-container hover:underline" href="#">
            Contact
          </a>
        </div>
        <p className="text-on-secondary-container">&copy; {new Date().getFullYear()} Carvo Logistics. All rights reserved.</p>
      </div>
    </footer>
  );
}
