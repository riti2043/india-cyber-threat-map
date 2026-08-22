import React, { useState, useEffect, useRef } from 'react';
import './ExploreReels.css';

export default function ExploreReels({ t, speakFeedback }) {
  const [currentReel, setCurrentReel] = useState(0);
  const containerRef = useRef(null);

  // A curated list of 8-10 educational accessibility YouTube shorts/videos
  const reels = [
    {
      id: "web-a11y",
      videoId: "20SHvU2PKsM", // W3C Introduction to Web Accessibility
      title: "Introduction to Web Accessibility",
      desc: "An introduction to why designing for everyone matters.",
      hashtags: "#a11y #inclusion",
      category: "Basics"
    },
    {
      id: "keyboard-compat",
      videoId: "OQGpqltSju8", // W3C Keyboard Compatibility
      title: "Keyboard Compatibility",
      desc: "Why keyboard navigation is essential for users with motor disabilities.",
      hashtags: "#keyboard #accessibility",
      category: "Assistive Tech"
    },
    {
      id: "color-contrast",
      videoId: "wiW_2tQ1Y28", // W3C Colors with Good Contrast
      title: "Colors with Good Contrast",
      desc: "Understanding how good contrast helps people with visual impairments.",
      hashtags: "#contrast #design",
      category: "Vision"
    },
    {
      id: "clear-layout",
      videoId: "pP1rQ05B4O8", // W3C Clear Layout and Design
      title: "Clear Layout and Design",
      desc: "How clear, consistent design helps people with cognitive disabilities.",
      hashtags: "#design #usability",
      category: "Cognitive"
    },
    {
      id: "video-captions",
      videoId: "8Z3YnL0U0Hw", // W3C Video Captions
      title: "Video Captions",
      desc: "Captions are essential for deaf users, and helpful for everyone else.",
      hashtags: "#captions #deaf",
      category: "Hearing"
    },
    {
      id: "voice-control",
      videoId: "l93W79qM2vU", // W3C Voice Recognition
      title: "Voice Recognition",
      desc: "How users control computers and write text using only their voice.",
      hashtags: "#voicecontrol #motor",
      category: "Assistive Tech"
    },
    {
      id: "text-to-speech",
      videoId: "Xo-Vn1yKq7I", // W3C Text to Speech
      title: "Text to Speech",
      desc: "Watch how a blind user navigates a website using a screen reader.",
      hashtags: "#screenreader #blind",
      category: "Vision"
    },
    {
      id: "customizable-text",
      videoId: "Fq1zVq_yFKI", // W3C Customizable Text
      title: "Customizable Text",
      desc: "Why allowing users to change fonts and spacing is important.",
      hashtags: "#fonts #vision",
      category: "Design"
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

  // Helper to extract proper YouTube URL
  // Some IDs in the array might be full watch URLs or just IDs, need to normalize to embed format
  const getEmbedUrl = (videoId) => {
    let id = videoId;
    if (id.includes('v=')) {
      id = id.split('v=')[1].split('&')[0];
    }
    // Autoplay logic can be tricky with iframes, especially multiple on one page.
    // Standard embed for now.
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1`;
  };

  return (
    <div className="explore-container">
      <div className="phone-frame">
        
        <div className="reels-container" ref={containerRef}>
          {reels.map((reel, index) => (
            <div key={reel.id} className="reel-slide">
              <div className="reel-video-wrapper">
                 <iframe 
                    className="reel-iframe"
                    src={getEmbedUrl(reel.videoId)}
                    title={reel.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                 ></iframe>
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
