import { img } from '../data'
export default function Footer({ onAdmin }) {
  return (
    <footer className="bg-ink pb-32 pt-12 text-white md:pb-12">
      <div className="container-x flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div className="space-y-1.5 text-sm text-white/70">
          <p className="text-base font-semibold text-white"><span className="text-brand">Nikah</span> Community Center</p>
          <p>Copyright © 2020 Nikah Community Center</p>
          <p>Booking system demo · <button onClick={onAdmin} className="text-white/50 underline-offset-2 hover:text-white hover:underline">Staff login</button></p>
          <p>All rights reserved by <a className="text-brand hover:underline" href="https://www.facebook.com/Sakib1056" target="_blank" rel="noreferrer">Mohammad Hafizur Rahman Sakib</a></p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium">Get The App</h3>
          <div className="flex flex-wrap gap-3 sm:flex-col">
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer"><img src={img('appstore.png')} alt="Download on the App Store" className="h-10 w-auto transition hover:scale-105" /></a>
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer"><img src={img('playstore.png')} alt="Get it on Google Play" className="h-10 w-auto transition hover:scale-105" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
