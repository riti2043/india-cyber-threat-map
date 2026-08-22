import React, { useState, useEffect, useRef } from 'react';
import './ExploreReels.css';

export default function ExploreReels({ t, speakFeedback, activePanel }) {
  const [currentReel, setCurrentReel] = useState(0);
  const containerRef = useRef(null);

  // A curated list of 8-10 educational accessibility YouTube shorts/videos
  const reels = [
    {
      id: "web-a11y",
      videoId: "20SHvU2PKsM",
      title: "Introduction to Web Accessibility",
      desc: "W3C introduction to web accessibility and standards that make the web work for everyone.",
      hashtags: "#a11y #w3c #inclusion",
      category: "Basics"
    },
    {
      id: "screen-reader",
      videoId: "dEbl5jvLKGQ",
      title: "Screen Reader Demo",
      desc: "Watch how a blind user navigates a website using a screen reader.",
      hashtags: "#screenreader #blind",
      category: "Assistive Tech"
    },
    {
      id: "colorblind",
      videoId: "FKSOe5NK_qQ",
      title: "What It's Like To Be Color Blind",
      desc: "A simulation of how colorblind people perceive the world differently.",
      hashtags: "#colorblind #vision",
      category: "Vision"
    },
    {
      id: "sign-lang",
      videoId: "0FcwzMq4iWg",
      title: "25 ASL Signs You Need to Know",
      desc: "Learn essential signs in American Sign Language for beginners.",
      hashtags: "#ASL #deaf #signlanguage",
      category: "Language"
    },
    {
      id: "keyboard-a11y",
      videoId: "uO8NJqAtMLM",
      title: "Keyboard Accessibility Testing",
      desc: "How to test and ensure your website works with keyboard-only navigation.",
      hashtags: "#keyboard #testing",
      category: "Testing"
    },
    {
      id: "inclusive-design",
      videoId: "i9hKX_MPaek",
      title: "Inclusive Design Principles",
      desc: "Key principles of inclusive design that benefit all users.",
      hashtags: "#inclusivedesign #ux",
      category: "Design"
    },
    {
      id: "assistive-tech",
      videoId: "omjVM1lwkII",
      title: "Assistive Technologies",
      desc: "Overview of technologies that help people with disabilities interact with the digital world.",
      hashtags: "#assistivetech #tools",
      category: "Assistive Tech"
    },
    {
      id: "disability-awareness",
      videoId: "8GLCqa-L7Go",
      title: "Disability Awareness Education",
      desc: "Building awareness and understanding of disability in our communities.",
      hashtags: "#awareness #education",
      category: "Awareness"
    }
  ];

  // Track scroll position to update current active dot
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Calculate which reel is currently most visible
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (index !== currentReel) {
        setCurrentReel(index);
        
        // Optional: Provide voice feedback when snapping to a new reel
        // if (speakFeedback) {
        //   speakFeedback(reels[index].title);
        // }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentReel, reels, speakFeedback]);

  // Handle keyboard navigation for easier testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      const container = containerRef.current;
      if (!container) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to extract proper YouTube URL and conditionally autoplay
  const getEmbedUrl = (videoId, isActive) => {
    let id = videoId;
    if (id.includes('v=')) {
      id = id.split('v=')[1].split('&')[0];
    }
    // Only autoplay if it's the currently active reel in view
    const autoplayParam = isActive ? '&autoplay=1' : '&autoplay=0';
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1${autoplayParam}`;
  };

  return (
    <div className="explore-container">
      <div className="phone-frame">
        
        <div className="reels-container" ref={containerRef}>
          {reels.map((reel, index) => (
            <div key={reel.id} className="reel-slide">
               <div className="reel-video-wrapper" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 {(activePanel === 'panel-explore' && index === currentReel) ? (
                   <iframe 
                      className="reel-iframe"
                      src={getEmbedUrl(reel.videoId, true)}
                      title={reel.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                   ></iframe>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', padding: '20px', textAlign: 'center' }}>
                     <i className="fa-solid fa-circle-play" style={{ fontSize: '3rem', color: 'var(--neon-magenta)', textShadow: '0 0 10px var(--neon-magenta)', marginBottom: '12px' }}></i>
                     <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{reel.title}</span>
                     <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '6px' }}>Scroll to activate video</span>
                   </div>
                 )}
               </div>
              
              <div className="reel-overlay-top">
                {reel.category}
              </div>
              
              <div className="reel-overlay-bottom">
                <h3 className="reel-title">{reel.title}</h3>
                <p className="reel-desc">{reel.desc}</p>
                <div className="reel-hashtags">{reel.hashtags}</div>
              </div>

              {/* Show scroll hint only on first slide */}
              {index === 0 && (
                <div className="scroll-hint">
                  <i className="fa-solid fa-chevron-down"></i>
                  <span>Scroll</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="reel-nav-dots">
          {reels.map((_, index) => (
            <div 
              key={index} 
              className={`nav-dot ${index === currentReel ? 'active' : ''}`}
              onClick={() => {
                const container = containerRef.current;
                if (container) {
                   container.scrollTo({
                     top: index * container.clientHeight,
                     behavior: 'smooth'
                   });
                }
              }}
            ></div>
          ))}
        </div>

      </div>
    </div>
  );
}
