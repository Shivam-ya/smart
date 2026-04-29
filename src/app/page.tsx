import Link from "next/link";
import { ArrowRight, QrCode, MapPin, BarChart3, Fingerprint } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 h-20 flex items-center border-b border-border">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-primary">
          <Fingerprint className="w-8 h-8" />
          <span>Smart Attend</span>
        </div>
        <nav className="ml-auto flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
          <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">Enroll Now</Link>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 flex justify-center items-center flex-col text-center px-4">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-6 shadow-sm border border-border">
            Welcome to the Future of Education
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Intelligent Attendance Systems for Modern Classrooms.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl text-lg md:text-xl">
            Streamline your class rolls with QR scanning, geographical bounds, and powerful analytics. Attendance has never been smarter.
          </p>
          <div className="mt-10 flex gap-4 flex-col sm:flex-row">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Teacher Login
            </Link>
          </div>
        </section>

        <section className="w-full py-24 bg-muted/50 border-t border-border flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start p-6 bg-card rounded-2xl shadow-sm border border-border transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-lg mb-4 text-primary">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dynamic QR Codes</h3>
                <p className="text-muted-foreground">Auto-refreshing QR codes ensure students must be present to scan and mark attendance.</p>
              </div>

              <div className="flex flex-col items-start p-6 bg-card rounded-2xl shadow-sm border border-border transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-lg mb-4 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Geo-Fencing</h3>
                <p className="text-muted-foreground">Ensure students are actually in class by enforcing a geographical radius for attendance marking.</p>
              </div>

              <div className="flex flex-col items-start p-6 bg-card rounded-2xl shadow-sm border border-border transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-lg mb-4 text-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Automated Analytics</h3>
                <p className="text-muted-foreground">Detailed insights into class performance, low attendance alerts, and easy CSV exports.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
