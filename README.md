# Wind Concert Band Website

A professional, responsive website for a community wind concert band, built with React, Vite, and Tailwind CSS. Inspired by the design and functionality of the GMC Orchestra website.

## 🎵 Features

### Public Website
- **Professional Design**: Clean, elegant layout with wind ensemble-inspired color palette
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Hero Section**: Engaging landing page with call-to-action buttons
- **About Us**: Band history, mission, conductor biography, and achievements
- **Performances**: Concert calendar with upcoming and past events
- **Join Us**: Comprehensive audition information and current openings
- **Contact**: Multiple contact methods with integrated contact form

### Design Highlights
- **Color Palette**: Deep navy blue primary (#040337) with brass accent colors
- **Typography**: Arvo serif for headlines, Lato sans-serif for body text
- **Professional Photography**: High-quality ensemble images throughout
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive navigation
- **Accessibility**: Proper heading structure, alt texts, and keyboard navigation

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd wind-concert-band
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
wind-concert-band/
├── public/
│   ├── vite.svg
│   └── ...
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation and branding
│   │   ├── Footer.jsx          # Site footer with links
│   │   └── Layout.jsx          # Main layout wrapper
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── About.jsx           # Band information
│   │   ├── Performances.jsx    # Concert calendar
│   │   ├── Join.jsx            # Audition information
│   │   └── Contact.jsx         # Contact information
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles and Tailwind
│   └── main.jsx                # App entry point
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── package.json
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-900: #040337    /* Deep navy blue */
--primary-800: #1c16c0    /* Medium navy */
--primary-600: #2d25f7    /* Bright blue */

/* Accent Colors */
--brass-600: #e6a441      /* Brass gold */
--brass-700: #d18b36      /* Dark brass */
```

### Typography
- **Headlines**: Arvo (serif) - Professional and elegant
- **Body Text**: Lato (sans-serif) - Clean and readable
- **Responsive scaling**: Adaptive font sizes for all devices

### Component Classes
```css
.btn-primary        /* Primary action buttons */
.btn-secondary      /* Secondary action buttons */
.btn-outline        /* Outline buttons */
.card              /* Content cards */
.hero-overlay      /* Hero section overlay */
.section-padding   /* Consistent section spacing */
.container-custom  /* Container with max-width */
```

## 📱 Responsive Design

The website is fully responsive with carefully crafted breakpoints:

- **Mobile**: 320px - 767px (optimized for phones)
- **Tablet**: 768px - 1023px (optimized for tablets)
- **Desktop**: 1024px+ (optimized for desktop screens)

### Key Responsive Features
- Collapsible mobile navigation
- Adaptive image sizing
- Flexible grid layouts
- Touch-friendly interactive elements
- Optimized typography scaling

## 🎯 Pages Overview

### Home (`/`)
- Hero section with call-to-action
- Welcome message and values
- Featured upcoming concert
- Member recruitment section

### About Us (`/about`)
- Band mission and history
- Timeline of achievements
- Conductor biography
- Community impact statistics

### Performances (`/performances`)
- Featured upcoming concert
- Complete concert calendar
- Past performance archive
- Newsletter subscription

### Join Us (`/join`)
- Current instrument openings
- Membership requirements
- Benefits of joining
- Detailed audition process

### Contact (`/contact`)
- Multiple contact methods
- Contact form
- Location and rehearsal info
- Frequently asked questions

## 🎪 Future Enhancements

### Phase 2: Member Portal
- User authentication system
- Private member announcements
- File sharing (sheet music, documents)
- Member directory

### Phase 3: Advanced Features
- Online audition scheduling
- Event RSVP system
- Payment processing for merchandise
- Admin content management

### Phase 4: Interactive Features
- Virtual concert streaming
- Member photo galleries
- Social media integration
- Email newsletter automation

## 🔧 Development Guidelines

### Adding New Pages
1. Create component in `src/pages/`
2. Add route to `src/App.jsx`
3. Update navigation in `src/components/Header.jsx`
4. Follow existing design patterns

### Styling Guidelines
- Use Tailwind utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing with `section-padding`
- Use custom component classes for common patterns

### Component Guidelines
- Keep components focused and reusable
- Use semantic HTML elements
- Include proper accessibility attributes
- Follow React best practices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎼 Acknowledgments

- Design inspired by GMC Orchestra website
- High-quality stock photos from Unsplash
- Icons provided by Lucide React
- Built with modern web technologies

---

**Wind Concert Band Website** - Excellence in Musical Performance Since 1985